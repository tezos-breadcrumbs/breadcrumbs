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
      tezos: {} as TezosToolkit,
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
      minimum_payment_amount: minimumDelegationBalance,
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
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveExcludedPaymentsByContext(
        resolveDelegatorRewards(
          resolveExcludedDelegators(resolveBakerRewards(args))
        )
      )
    );

    const output = resolveExcludedPaymentsByMinimumAmount(input);

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
          note: ENoteType.PaymentBelowMinimum,
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
      minimum_payment_amount: minimumDelegationBalance,
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
    };

    const input = resolveExcludedPaymentsByMinimumAmount(
      resolveExcludedPaymentsByContext(
        resolveDelegatorRewards(
          resolveExcludedDelegators(resolveBakerRewards(args))
        )
      )
    );

    const output = resolveExcludedPaymentsByMinimumAmount(input);

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
          amount: new BigNumber(0),
          transactionFee: new BigNumber(0),
          note: ENoteType.PaymentBelowMinimum,
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

    expect(output.cycleReport.excludedPayments).toStrictEqual([]);

    expect(output.cycleReport.creditablePayments).toStrictEqual(
      expectedCreditablePayments
    );
  });

  it("avoids double-processing by `resolveExcludedPaymentsByMinimumAmount` (accounting_mode: true)", async () => {
    const minimumDelegatorBalance = 500;
    const minimumPaymentAmount = 1;

    const config = generateConfig({
      minimum_delegator_balance: minimumDelegatorBalance,
      minimum_payment_amount: minimumPaymentAmount,
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
    const expectedCreditablePayments = input.cycleReport.creditablePayments;
    const expectedDelegatorPayments: DelegatorPayment[] = [];

    for (let i = 0; i < inputPayments.length; i++) {
      if (
        inputPayments[i].delegatorBalance.lt(
          new BigNumber(minimumDelegatorBalance).times(MUTEZ_FACTOR)
        ) &&
        inputPayments[i].note !== ENoteType.PaymentBelowMinimum
      ) {
        additionalFeeIncome = additionalFeeIncome.plus(inputPayments[i].amount);
        expectedCreditablePayments.push({
          ...inputPayments[i],
          amount: new BigNumber(0),
          transactionFee: new BigNumber(0),
          note: ENoteType.PaymentBelowMinimum,
          fee: inputPayments[i].amount,
        });
      } else {
        expectedDelegatorPayments.push(inputPayments[i]);
      }
    }

    expect(output.cycleReport.feeIncome).toStrictEqual(
      input.cycleReport.feeIncome.plus(additionalFeeIncome)
    );

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      expectedDelegatorPayments
    );

    expect(output.cycleReport.creditablePayments).toStrictEqual(
      expectedCreditablePayments
    );

    expect(output.cycleReport.excludedPayments).toStrictEqual([]);
  });

  it("avoids double-processing by `resolveExcludedPaymentsByMinimumAmount` (accounting_mode: false)", async () => {
    const minimumDelegatorBalance = 500;
    const minimumPaymentAmount = 1;

    const config = generateConfig({
      minimum_delegator_balance: minimumDelegatorBalance,
      minimum_payment_amount: minimumPaymentAmount,
      accounting_mode: false,
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
    const expectedExcludedPayments = input.cycleReport.excludedPayments;
    const expectedDelegatorPayments: DelegatorPayment[] = [];

    for (let i = 0; i < inputPayments.length; i++) {
      if (
        inputPayments[i].delegatorBalance.lt(
          new BigNumber(minimumDelegatorBalance).times(MUTEZ_FACTOR)
        ) &&
        inputPayments[i].note !== ENoteType.PaymentBelowMinimum
      ) {
        additionalFeeIncome = additionalFeeIncome.plus(inputPayments[i].amount);
        expectedExcludedPayments.push({
          ...inputPayments[i],
          amount: new BigNumber(0),
          transactionFee: new BigNumber(0),
          note: ENoteType.PaymentBelowMinimum,
          fee: inputPayments[i].amount,
        });
      } else {
        expectedDelegatorPayments.push(inputPayments[i]);
      }
    }

    expect(output.cycleReport.feeIncome).toStrictEqual(
      input.cycleReport.feeIncome.plus(additionalFeeIncome)
    );

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      expectedDelegatorPayments
    );

    expect(output.cycleReport.excludedPayments).toStrictEqual(
      expectedExcludedPayments
    );

    expect(output.cycleReport.creditablePayments).toStrictEqual([]);
  });
});
