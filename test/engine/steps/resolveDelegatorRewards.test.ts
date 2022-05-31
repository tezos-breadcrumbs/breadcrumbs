/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";
import BigNumber from "bignumber.js";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import { initializeCycleReport } from "src/engine/helpers";
import { sum } from "src/utils/math";
import {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
} from "src/engine/steps";

describe("resolveDelegatorRewards", () => {
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
      .times(delegatorShareOfRewards)
      .dp(0, BigNumber.ROUND_DOWN);

    const feeIncomeTotal = new BigNumber(config.default_fee)
      .div(100)
      .times(delegatorShareOfRewards)
      .dp(0, BigNumber.ROUND_DOWN);

    const ROUNDING_ADJUSTMENT_1 = 5;
    expect(output.cycleReport.feeIncome).toStrictEqual(
      feeIncomeTotal.minus(ROUNDING_ADJUSTMENT_1)
    );

    const ROUNDING_ADJUSTMENT_2 = 7;
    expect(output.distributableRewards).toStrictEqual(
      input.distributableRewards
        .minus(feeIncomeTotal)
        .minus(delegatorTotal)
        .plus(ROUNDING_ADJUSTMENT_2)
    );

    _.each(output.cycleReport.delegatorPayments, (payment) => {
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

      const expectedamount = share?.balance
        .div(input.cycleData.cycleDelegatedBalance)
        .times(input.distributableRewards)
        .times(
          new BigNumber(100)
            .minus(
              input.config.fee_exceptions[payment.delegator] ||
                input.config.default_fee
            )
            .dividedBy(100)
        )
        .dp(0, BigNumber.ROUND_DOWN);

      expect(payment.amount).toStrictEqual(expectedamount);
    });

    expect(output.cycleReport.delegatorPayments).toHaveLength(
      input.cycleData.cycleShares.length
    );
  });

  it("allocates payments to delegators correctly (scenario: fee exception)", async () => {
    const delegator = "tz1TRSPwnJD6qv5LeE76uSQ1YppVEvzomFvS";
    const config = generateConfig({
      fee_exceptions: { [delegator]: "8" },
      default_fee: "0",
    });

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

    _.each(output.cycleReport.delegatorPayments, (payment) => {
      const share = _.find(
        output.cycleData.cycleShares,
        (share) => share.address === payment.delegator
      );

      expect(payment.bakerStakingBalance).toEqual(cycleStakingBalance);
      expect(payment.cycle).toEqual(input.cycleReport.cycle);
      expect(payment.delegator).toEqual(share?.address);
      expect(payment.delegatorBalance).toEqual(share?.balance);
      expect(payment.bakerCycleRewards).toEqual(cycleRewards);

      const paymentAddress =
        input.config.redirect_payments[payment.delegator] || payment.delegator;

      const feeRate = new BigNumber(
        input.config.fee_exceptions[payment.delegator] ||
          input.config.default_fee
      ).div(100);

      const amount = share?.balance
        .div(input.cycleData.cycleDelegatedBalance)
        .times(input.distributableRewards)
        .times(
          new BigNumber(100)
            .minus(
              input.config.fee_exceptions[payment.delegator] ||
                input.config.default_fee
            )
            .dividedBy(100)
        )
        .dp(0, BigNumber.ROUND_DOWN);

      expect(payment.paymentAddress).toEqual(paymentAddress);
      expect(payment.feeRate).toStrictEqual(feeRate);
      expect(payment.amount).toStrictEqual(amount);
    });

    /* SANITY CHECK */
    expect(
      _.find(
        output.cycleReport.delegatorPayments,
        (payment) => payment.delegator == delegator
      )?.feeRate
    ).toEqual(new BigNumber("0.08"));
  });

  it("allocates payments to delegators correctly (scenario: redirect address)", async () => {
    const delegator = "tz1TRSPwnJD6qv5LeE76uSQ1YppVEvzomFvS";
    const redirect = "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur";
    const config = generateConfig({
      redirect_payments: { [delegator]: redirect },
    });

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

    _.each(output.cycleReport.delegatorPayments, (payment) => {
      const share = _.find(
        output.cycleData.cycleShares,
        (share) => share.address === payment.delegator
      );

      expect(payment.bakerStakingBalance).toEqual(cycleStakingBalance);
      expect(payment.cycle).toEqual(input.cycleReport.cycle);
      expect(payment.delegator).toEqual(share?.address);
      expect(payment.delegatorBalance).toEqual(share?.balance);
      expect(payment.bakerCycleRewards).toEqual(cycleRewards);

      const paymentAddress =
        input.config.redirect_payments[payment.delegator] || payment.delegator;

      const feeRate = new BigNumber(
        input.config.fee_exceptions[payment.delegator] ||
          input.config.default_fee
      ).div(100);

      const amount = share?.balance
        .div(input.cycleData.cycleDelegatedBalance)
        .times(input.distributableRewards)
        .times(
          new BigNumber(100)
            .minus(
              input.config.fee_exceptions[payment.delegator] ||
                input.config.default_fee
            )
            .dividedBy(100)
        )
        .dp(0, BigNumber.ROUND_DOWN);

      expect(payment.paymentAddress).toEqual(paymentAddress);
      expect(payment.feeRate).toStrictEqual(feeRate);
      expect(payment.amount).toStrictEqual(amount);
    });

    /* SANITY CHECK */
    expect(
      _.find(
        output.cycleReport.delegatorPayments,
        (payment) => payment.delegator == delegator
      )?.paymentAddress
    ).toEqual(redirect);
  });

  it("allocates payments to delegators correctly (scenario: overdelegation_blacklist)", async () => {
    const delegator = "tz1TRSPwnJD6qv5LeE76uSQ1YppVEvzomFvS";
    const config = generateConfig({
      overdelegation_blacklist: [delegator],
      default_fee: "0",
    });

    const cycleData = await client.getCycleData(config.baking_address, 470);
    const { cycleRewards, cycleStakingBalance } = cycleData;

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleRewards,
    };

    const input = resolveExcludedDelegators(resolveBakerRewards(args));

    /* SANITY PRE-CHECK */
    expect(
      _.find(input.cycleData.cycleShares, (share) => share.address == delegator)
    ).toBeUndefined();

    expect(input.cycleData.cycleShares).toHaveLength(
      cycleData.cycleShares.length - 1
    );

    const output = resolveDelegatorRewards(input);
    const applicableDelegatedBalance = sum(
      ..._.map(input.cycleData.cycleShares, (share) => share.balance)
    );

    _.each(output.cycleReport.delegatorPayments, (payment) => {
      const share = _.find(
        output.cycleData.cycleShares,
        (share) => share.address === payment.delegator
      );

      expect(payment.bakerStakingBalance).toEqual(cycleStakingBalance);
      expect(payment.cycle).toEqual(input.cycleReport.cycle);
      expect(payment.delegator).toEqual(share?.address);
      expect(payment.delegatorBalance).toEqual(share?.balance);
      expect(payment.bakerCycleRewards).toEqual(cycleRewards);

      const paymentAddress =
        input.config.redirect_payments[payment.delegator] || payment.delegator;

      const feeRate = new BigNumber(
        input.config.fee_exceptions[payment.delegator] ||
          input.config.default_fee
      ).div(100);

      let amount = share?.balance
        .div(applicableDelegatedBalance)
        .times(input.distributableRewards)
        .dp(0, BigNumber.ROUND_DOWN)
        .times(
          new BigNumber(100)
            .minus(
              input.config.fee_exceptions[payment.delegator] ||
                input.config.default_fee
            )
            .dividedBy(100)
        );

      expect(payment.paymentAddress).toEqual(paymentAddress);
      expect(payment.feeRate).toStrictEqual(feeRate);
      expect(payment.amount).toStrictEqual(amount);
    });

    /* SANITY CHECK */
    expect(
      _.find(
        output.cycleReport.delegatorPayments,
        (payment) => payment.delegator == delegator
      )?.paymentAddress
    ).toBeUndefined();

    const ROUNDING_ADJUSTMENT = 4;
    /* Payments are slightly lower than distributable rewards due to rounding */
    /* The below condition holds as the fee rate is zero for testing purposes */
    expect(
      sum(..._.map(output.cycleReport.delegatorPayments, (i) => i.amount))
    ).toStrictEqual(input.distributableRewards.minus(ROUNDING_ADJUSTMENT));
  });
});
