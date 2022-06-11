/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";
import BigNumber from "bignumber.js";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import { initializeCycleReport } from "src/engine/helpers";
import {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
} from "src/engine/steps";
import { MUTEZ_FACTOR } from "src/utils/constants";
import { ENoteType } from "src/engine/interfaces";

describe("resolveExcludedPaymentsByMinimumAmount", () => {
  Polly.start();

  it("does not exclude payments if minimum delegator balance is set to zero", async () => {
    const config = generateConfig({
      minimum_delegator_balance: 0,
    });

    const cycleData = await client.getCycleData(config.baking_address, 470);
    const { cycleRewards, cycleShares } = cycleData;

    const numberOfDelegators = cycleShares.length;

    expect(numberOfDelegators).toEqual(9);
    /* Sentry & Legate has 9 delegators in cycle 470 */

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleRewards,
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveDelegatorRewards(
        resolveExcludedDelegators(resolveBakerRewards(args))
      )
    );

    const output = resolveExcludedPaymentsByMinimumDelegatorBalance(input);

    expect(input).toStrictEqual(output);

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      input.cycleReport.delegatorPayments
    );

    expect(
      _.find(output.cycleReport.delegatorPayments, (payment) =>
        payment.amount.eq(0)
      )
    ).toBeUndefined();
  });

  it("exclude payments if the associated delegation balance is below the minimum", async () => {
    const minimumDelegatorBalance = 500;

    const config = generateConfig({
      minimum_delegator_balance: minimumDelegatorBalance,
    });

    const cycleData = await client.getCycleData(config.baking_address, 470);
    const { cycleRewards, cycleShares } = cycleData;

    const numberOfDelegators = cycleShares.length;

    expect(numberOfDelegators).toEqual(9);
    /* Sentry & Legate has 9 delegators in cycle 470 */

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleRewards,
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveDelegatorRewards(
        resolveExcludedDelegators(resolveBakerRewards(args))
      )
    );

    const output = resolveExcludedPaymentsByMinimumDelegatorBalance(input);

    const {
      cycleReport: { delegatorPayments: inputPayments },
    } = input;

    const {
      cycleReport: { delegatorPayments: outputPayments },
    } = output;

    expect(
      _.filter(outputPayments, (payment) => payment.amount.eq(0)).length
    ).toBeGreaterThan(0);

    let additionalFeeIncome = new BigNumber(0);
    for (let i = 0; i < inputPayments.length; i++) {
      if (
        inputPayments[i].delegatorBalance.lt(
          new BigNumber(minimumDelegatorBalance).times(MUTEZ_FACTOR)
        )
      ) {
        additionalFeeIncome = additionalFeeIncome.plus(inputPayments[i].amount);
        expect(outputPayments[i].amount.eq(0));
        expect(outputPayments[i].fee).toStrictEqual(inputPayments[i].amount);
        expect(outputPayments[i].note).toEqual(ENoteType.BalanceBelowMinimum);
      } else {
        expect(outputPayments[i]).toStrictEqual(inputPayments[i]);
      }
    }

    expect(output.cycleReport.feeIncome).toStrictEqual(
      input.cycleReport.feeIncome.plus(additionalFeeIncome)
    );
  });
});
