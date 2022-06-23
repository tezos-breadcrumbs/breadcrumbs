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
  resolveEstimateTransactionFees,
  resolveExcludedDelegators,
  resolveExcludedPaymentsByContext,
  resolveExcludedPaymentsByMinimumAmount,
} from "src/engine/steps";
import { MUTEZ_FACTOR } from "src/utils/constants";
import { DelegatorPayment, ENoteType } from "src/engine/interfaces";

describe("resolveExcludedPaymentsByMinimumAmount", () => {
  Polly.start();
  const provider = new TezosToolkit("https://ithacanet.ecadinfra.com");

  let mockProvider;

  beforeEach(() => {
    mockProvider = jest.spyOn(provider.estimate, "batch");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("does not exclude payments if minimum payment amount is set at zero", async () => {
    const config = generateConfig({
      minimum_payment_amount: 0,
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

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const output = resolveExcludedPaymentsByMinimumAmount(input);

    expect(output.cycleReport.delegatorPayments).toStrictEqual(
      input.cycleReport.delegatorPayments
    );

    expect(output.cycleReport.excludedPayments).toStrictEqual([]);
  });

  it("exclude payments if they are below the specified minimum amount", async () => {
    const minimumPaymentAmount = 2;

    const config = generateConfig({
      minimum_payment_amount: minimumPaymentAmount,
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
      tezos: provider,
    };

    const inputWithoutTransactionFees = resolveExcludedPaymentsByContext(
      resolveDelegatorRewards(
        resolveExcludedDelegators(resolveBakerRewards(args))
      )
    );

    mockProvider.mockResolvedValue(
      inputWithoutTransactionFees.cycleReport.delegatorPayments.map(() => ({
        totalCost: 1,
      }))
    );

    const input = await resolveEstimateTransactionFees(
      inputWithoutTransactionFees
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
        inputPayments[i].amount.lt(
          new BigNumber(minimumPaymentAmount).times(MUTEZ_FACTOR)
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

  it("correctly processes stashed payments if `accounting_mode` is true", async () => {
    const minimumPaymentAmount = 2;

    const config = generateConfig({
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
      tezos: provider,
    };

    const inputWithoutTransactionFees = resolveExcludedPaymentsByContext(
      resolveDelegatorRewards(
        resolveExcludedDelegators(resolveBakerRewards(args))
      )
    );

    mockProvider.mockResolvedValue(
      inputWithoutTransactionFees.cycleReport.delegatorPayments.map(() => ({
        totalCost: 1,
      }))
    );

    const input = await resolveEstimateTransactionFees(
      inputWithoutTransactionFees
    );

    const output = resolveExcludedPaymentsByMinimumAmount(input);

    const {
      cycleReport: { delegatorPayments: inputPayments },
    } = input;

    const expectedCreditablePayments: DelegatorPayment[] = [];
    const expectedDelegatorPayments: DelegatorPayment[] = [];

    for (let i = 0; i < inputPayments.length; i++) {
      if (
        inputPayments[i].amount.lt(
          new BigNumber(minimumPaymentAmount).times(MUTEZ_FACTOR)
        )
      ) {
        expectedCreditablePayments.push({
          ...inputPayments[i],
          transactionFee: new BigNumber(0),
          note: ENoteType.PaymentBelowMinimum,
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
});
