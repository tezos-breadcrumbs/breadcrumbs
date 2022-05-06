/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";

import client from "src/client";
import { generateConfig } from "test/helpers";
import { initializeCycleReport, isOverDelegated } from "src/engine/helpers";
import { resolveExcludedDelegators } from "src/engine/steps/resolveExcludedDelegators";

import * as Polly from "test/helpers/polly";
import { resolveBakerRewards } from "src/engine/steps/resolveBakerRewards";
import { resolveDelegatorRewards } from "src/engine/steps/resolveDelegatorRewards";
import BigNumber from "bignumber.js";
import { sum } from "src/utils/math";

describe("resolveExcludedDelegators", () => {
  Polly.start();

  it("allocates payments to delegators correctly (scenario: simple configuration)", async () => {
    const config = generateConfig();

    const cycleData = await client.getCycleData(config.baking_address, 470);
    const { cycleRewards, cycleDelegatedBalance, cycleStakingBalance } =
      cycleData;

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleRewards,
    };

    const input = resolveExcludedDelegators(resolveBakerRewards(args));
    const output = resolveDelegatorRewards(input);

    const delegatorShareOfRewards = sum(
      ..._.map(input.cycleData.cycleShares, (share) =>
        input.distributableRewards.times(
          share.balance.div(cycleDelegatedBalance)
        )
      )
    );

    const percentageFee = new BigNumber(config.default_fee).div(100);
    const delegatorTotal = new BigNumber(1)
      .minus(percentageFee)
      .times(delegatorShareOfRewards);

    const feeIncomeTotal = new BigNumber(config.default_fee)
      .div(100)
      .times(delegatorShareOfRewards);

    expect(output.cycleReport.feeIncome).toStrictEqual(feeIncomeTotal);
    expect(output.distributableRewards).toStrictEqual(
      input.distributableRewards.minus(feeIncomeTotal).minus(delegatorTotal)
    );

    _.each(output.cycleReport.payments, (payment) => {
      const share = _.find(
        output.cycleData.cycleShares,
        (share) => share.address === payment.delegator
      );

      expect(payment.bakerStakingBalance).toEqual(cycleStakingBalance);
      expect(payment.cycle).toEqual(input.cycleReport.cycle);
      expect(payment.delegator).toEqual(share?.address);
      expect(payment.delegatorBalance).toEqual(share?.balance);
      expect(payment.bakerCycleRewards).toEqual(cycleRewards);

      expect(payment.paymentAddress).toEqual(
        input.config.redirect_payments[payment.delegator] || payment.delegator
      );

      expect(payment.feeRate).toStrictEqual(
        new BigNumber(
          input.config.fee_exceptions[payment.delegator] ||
            input.config.default_fee
        ).div(100)
      );

      const expectedPaymentAmount = share?.balance
        .div(input.cycleData.cycleDelegatedBalance)
        .times(input.distributableRewards)
        .times(
          new BigNumber(100)
            .minus(
              input.config.fee_exceptions[payment.delegator] ||
                input.config.default_fee
            )
            .dividedBy(100)
        );

      expect(payment.paymentAmount).toStrictEqual(expectedPaymentAmount);
    });

    expect(output.cycleReport.payments).toHaveLength(
      input.cycleData.cycleShares.length
    );
  });
});
