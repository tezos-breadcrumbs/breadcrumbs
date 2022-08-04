/** @jest-environment setup-polly-jest/jest-environment-node */

import BigNumber from "bignumber.js";
import { TezosToolkit } from "@taquito/taquito";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import { initializeCycleReport } from "src/engine/helpers";
import {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
  resolveExcludedPaymentsByContext,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
} from "src/engine/steps";
import { MUTEZ_FACTOR } from "src/utils/constants";
import { DelegatorPayment, ENoteType } from "src/engine/interfaces";

describe("resolveExcludedPaymentsByMinimumDelegatorBalance", () => {
  Polly.start();

  it("does not exclude payments if minimum delegator balance is not set", async () => {
    const config = generateConfig();

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
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveDelegatorRewards(
        resolveExcludedDelegators(resolveBakerRewards(args))
      )
    );

    const output = resolveExcludedPaymentsByMinimumDelegatorBalance(input);

    expect(input).toStrictEqual(output);
  });

  it("exclude payments if the associated delegation balance is below the minimum", async () => {
    const minimumDelegationBalance = 500;

    const config = generateConfig({
      delegator_requirements: { minimum_balance: minimumDelegationBalance },
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
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveExcludedPaymentsByMinimumAmount(
        resolveExcludedPaymentsByContext(
          resolveDelegatorRewards(
            resolveExcludedDelegators(resolveBakerRewards(args))
          )
        )
      )
    );

    const output = resolveExcludedPaymentsByMinimumDelegatorBalance(input);

    const {
      cycleReport: { delegatorPayments: inputPayments },
    } = input;

    let additionalFeeIncome = new BigNumber(0);
    const expectedExcludedPayments: DelegatorPayment[] = [];
    const expectedDelegatorPayments: DelegatorPayment[] = [];

    for (let i = 0; i < inputPayments.length; i++) {
      if (
        inputPayments[i].delegatorBalance.lt(
          new BigNumber(minimumDelegationBalance).times(MUTEZ_FACTOR)
        )
      ) {
        additionalFeeIncome = additionalFeeIncome.plus(inputPayments[i].amount);
        expectedExcludedPayments.push({
          ...inputPayments[i],
          amount: new BigNumber(0),
          transactionFee: new BigNumber(0),
          note: ENoteType.BalanceBelowMinimum,
          fee: inputPayments[i].amount,
        });
      } else {
        expectedDelegatorPayments.push(inputPayments[i]);
      }
    }

    expect(output.cycleReport.delegatorPayments.length).toEqual(
      inputPayments.length - output.cycleReport.excludedPayments.length
    );

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      expectedDelegatorPayments
    );

    expect(output.cycleReport.excludedPayments).toStrictEqual(
      expectedExcludedPayments
    );

    expect(output.cycleReport.creditablePayments).toStrictEqual([]);
  });

  it("adds excludable payments to `creditablePayments` if `accounting_mode` is true", async () => {
    const minimumDelegationBalance = 500;

    const config = generateConfig({
      delegator_requirements: { minimum_balance: minimumDelegationBalance },
      accounting_mode: true,
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
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveExcludedPaymentsByContext(
        resolveDelegatorRewards(
          resolveExcludedDelegators(resolveBakerRewards(args))
        )
      )
    );

    const output = resolveExcludedPaymentsByMinimumDelegatorBalance(input);

    const {
      cycleReport: { delegatorPayments: inputPayments },
    } = input;

    let additionalFeeIncome = new BigNumber(0);
    const expectedCreditablePayments: DelegatorPayment[] = [];
    const expectedDelegatorPayments: DelegatorPayment[] = [];

    for (let i = 0; i < inputPayments.length; i++) {
      if (
        inputPayments[i].delegatorBalance.lt(
          new BigNumber(minimumDelegationBalance).times(MUTEZ_FACTOR)
        )
      ) {
        additionalFeeIncome = additionalFeeIncome.plus(inputPayments[i].amount);
        expectedCreditablePayments.push({
          ...inputPayments[i],
          transactionFee: new BigNumber(0),
          note: ENoteType.BalanceBelowMinimum,
        });
      } else {
        expectedDelegatorPayments.push(inputPayments[i]);
      }
    }

    expect(output.cycleReport.delegatorPayments.length).toEqual(
      inputPayments.length - output.cycleReport.creditablePayments.length
    );

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      expectedDelegatorPayments
    );

    expect(output.cycleReport.excludedPayments).toStrictEqual([]);

    expect(output.cycleReport.creditablePayments).toStrictEqual(
      expectedCreditablePayments
    );
  });

  it("avoids double-processing by `resolveExcludedPaymentsByMinimumAmount` (accounting_mode: true)", async () => {
    const cycle = 494;
    const minimumDelegatorBalance = 175;
    const minimumPaymentAmount = 0.01;

    /* 
      In cycle 494, Sentry & Legate has two delegators 
      excludable by the above minimum payment amount and 
      an additional delegator excludable by the minimum
      delegation amount.
    */

    const config = generateConfig({
      delegator_requirements: { minimum_balance: minimumDelegatorBalance },
      payment_requirements: { minimum_amount: minimumPaymentAmount },
      accounting_mode: true,
    });

    const cycleData = await client.getCycleData(config.baking_address, cycle);
    const { cycleRewards, cycleShares } = cycleData;

    const numberOfDelegators = cycleShares.length;

    expect(numberOfDelegators).toEqual(12);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleRewards,
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveExcludedPaymentsByContext(
        resolveDelegatorRewards(
          resolveExcludedDelegators(resolveBakerRewards(args))
        )
      )
    );

    /* 
      Sanity check that two delegators have excluded from immediate 
      payment by resolveExcludedPaymentsByMinimumAmount
    */

    expect(input.cycleReport.creditablePayments).toHaveLength(2);

    let expectedCreditablePayments = input.cycleReport.creditablePayments;
    let expectedDelegatorPayments: DelegatorPayment[] = [];

    for (let i = 0; i < input.cycleReport.delegatorPayments.length; i++) {
      if (
        input.cycleReport.delegatorPayments[i].delegatorBalance.lt(
          new BigNumber(minimumDelegatorBalance).times(MUTEZ_FACTOR)
        )
      ) {
        expectedCreditablePayments = [
          ...expectedCreditablePayments,
          {
            ...input.cycleReport.delegatorPayments[i],
            transactionFee: new BigNumber(0),
            note: ENoteType.BalanceBelowMinimum,
          },
        ];
      } else {
        expectedDelegatorPayments = [
          ...expectedDelegatorPayments,
          input.cycleReport.delegatorPayments[i],
        ];
      }
    }

    const output = resolveExcludedPaymentsByMinimumDelegatorBalance(input);

    /* 
      Sanity check that an additional delegator has been
      excluded by resolveExcludedPaymentsByMinimumDelegatorBalance
    */

    expect(input.cycleReport.creditablePayments).toHaveLength(2);
    expect(output.cycleReport.creditablePayments).toHaveLength(3);

    /* Fee income is unchanged as `accounting_mode` is active */
    expect(output.cycleReport.feeIncome).toStrictEqual(
      input.cycleReport.feeIncome
    );

    expect(output.cycleReport.delegatorPayments).toHaveLength(
      input.cycleReport.delegatorPayments.length - 1
    );

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      expectedDelegatorPayments
    );

    expect(output.cycleReport.creditablePayments).toStrictEqual(
      expectedCreditablePayments
    );

    expect(output.cycleReport.creditablePayments).toHaveLength(
      input.cycleReport.creditablePayments.length + 1
    );

    expect(output.cycleReport.excludedPayments).toStrictEqual([]);
  });

  it("avoids double-processing by `resolveExcludedPaymentsByMinimumAmount` (accounting_mode: false)", async () => {
    const cycle = 494;
    const minimumDelegatorBalance = 175;
    const minimumPaymentAmount = 0.01;

    /* 
      In cycle 494, Sentry & Legate has two delegators 
      excludable by the above minimum payment amount and 
      an additional delegator excludable by the minimum
      delegation amount.
    */

    const config = generateConfig({
      delegator_requirements: { minimum_balance: minimumDelegatorBalance },
      payment_requirements: { minimum_amount: minimumPaymentAmount },
      accounting_mode: false,
    });

    const cycleData = await client.getCycleData(config.baking_address, cycle);
    const { cycleRewards, cycleShares } = cycleData;

    const numberOfDelegators = cycleShares.length;

    expect(numberOfDelegators).toEqual(12);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleRewards,
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveExcludedPaymentsByContext(
        resolveDelegatorRewards(
          resolveExcludedDelegators(resolveBakerRewards(args))
        )
      )
    );

    /* 
      Sanity check that two delegators have excluded from immediate 
      payment by resolveExcludedPaymentsByMinimumAmount
    */
    expect(input.cycleReport.excludedPayments).toHaveLength(2);

    let additionalFeeIncome = new BigNumber(0);
    let expectedExcludedPayments = input.cycleReport.excludedPayments;
    let expectedDelegatorPayments: DelegatorPayment[] = [];

    for (let i = 0; i < input.cycleReport.delegatorPayments.length; i++) {
      if (
        input.cycleReport.delegatorPayments[i].delegatorBalance.lt(
          new BigNumber(minimumDelegatorBalance).times(MUTEZ_FACTOR)
        )
      ) {
        additionalFeeIncome = additionalFeeIncome.plus(
          input.cycleReport.delegatorPayments[i].amount
        );

        expectedExcludedPayments = [
          ...expectedExcludedPayments,
          {
            ...input.cycleReport.delegatorPayments[i],
            amount: new BigNumber(0),
            fee: input.cycleReport.delegatorPayments[i].amount,
            transactionFee: new BigNumber(0),
            note: ENoteType.BalanceBelowMinimum,
          },
        ];
      } else {
        expectedDelegatorPayments = [
          ...expectedDelegatorPayments,
          input.cycleReport.delegatorPayments[i],
        ];
      }
    }

    const output = resolveExcludedPaymentsByMinimumDelegatorBalance(input);

    /* 
      Sanity check that an additional delegator has been
      excluded by resolveExcludedPaymentsByMinimumDelegatorBalance
    */
    expect(input.cycleReport.excludedPayments).toHaveLength(2);
    expect(output.cycleReport.excludedPayments).toHaveLength(3);

    /* Fee income is unchanged as `accounting_mode` is active */
    expect(output.cycleReport.feeIncome).toStrictEqual(
      input.cycleReport.feeIncome.plus(additionalFeeIncome)
    );

    expect(output.cycleReport.delegatorPayments).toHaveLength(
      input.cycleReport.delegatorPayments.length - 1
    );

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      expectedDelegatorPayments
    );

    expect(output.cycleReport.excludedPayments).toStrictEqual(
      expectedExcludedPayments
    );

    expect(output.cycleReport.excludedPayments).toHaveLength(
      input.cycleReport.excludedPayments.length + 1
    );

    expect(output.cycleReport.creditablePayments).toStrictEqual([]);
  });
});
