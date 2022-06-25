/** @jest-environment setup-polly-jest/jest-environment-node */
import BigNumber from "bignumber.js";
import { TezosToolkit } from "@taquito/taquito";

import client from "src/api-client";

import {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedPaymentsByContext,
  resolveExcludedDelegators,
  resolveEstimateTransactionFees,
  resolveSubstractTransactionFees,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
} from "src/engine/steps";

import { initializeCycleReport } from "src/engine/helpers";

import * as Polly from "test/helpers/polly";
import { generateConfig } from "test/helpers";
import { EFeePayer } from "src/engine/interfaces";

describe("resolveEstimateTransactionFees", () => {
  Polly.start();
  const provider = new TezosToolkit("https://ithacanet.ecadinfra.com");

  let mockProvider;

  beforeEach(() => {
    mockProvider = jest.spyOn(provider.estimate, "batch");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("correctly handles transaction fees if baker is the payer", async () => {
    const config = generateConfig({
      payment_requirements: { baker_pays_transaction_fee: true },
    });

    const cycleReport = initializeCycleReport(470);
    const cycleData = await client.getCycleData(config.baking_address, 470);

    const { cycleRewards: distributableRewards } = cycleData;

    const args = {
      config,
      cycleData,
      cycleReport,
      distributableRewards,
      tezos: provider,
    };

    const partialInput = resolveExcludedPaymentsByContext(
      resolveDelegatorRewards(
        resolveExcludedDelegators(resolveBakerRewards(args))
      )
    );

    mockProvider.mockResolvedValue(
      partialInput.cycleReport.delegatorPayments.map(() => ({
        totalCost: 1,
      }))
    );

    const inputWithTransactionFees = await resolveEstimateTransactionFees(
      partialInput
    );

    const input = resolveExcludedPaymentsByMinimumDelegatorBalance(
      resolveExcludedPaymentsByMinimumAmount(inputWithTransactionFees)
    );

    const output = resolveSubstractTransactionFees(input);

    const inputPayments = input.cycleReport.delegatorPayments;
    const outputPayments = output.cycleReport.delegatorPayments;

    /* Sanity check */
    expect(inputPayments.length).toEqual(outputPayments.length);

    for (let i = 0; i < inputPayments.length; i++) {
      expect(outputPayments[i].transactionFeePaidBy).toEqual(EFeePayer.Baker);
      expect(outputPayments[i].amount).toStrictEqual(inputPayments[i].amount);
    }

    const expectedFeesPaid = new BigNumber(
      outputPayments.length
    ); /* 1 mutez per payment */
    expect(output.cycleReport.feesPaid).toStrictEqual(expectedFeesPaid);

    const expectedFeeIncome =
      input.cycleReport.feeIncome.minus(expectedFeesPaid);
    expect(output.cycleReport.feeIncome).toEqual(expectedFeeIncome);
  });

  it("correctly handles transaction fees if delegator is the payer", async () => {
    const config = generateConfig({
      payment_requirements: { baker_pays_transaction_fee: false },
    });

    const cycleReport = initializeCycleReport(470);
    const cycleData = await client.getCycleData(config.baking_address, 470);

    const { cycleRewards: distributableRewards } = cycleData;

    const args = {
      config,
      cycleData,
      cycleReport,
      distributableRewards,
      tezos: provider,
    };

    const partialInput = resolveExcludedPaymentsByContext(
      resolveDelegatorRewards(
        resolveExcludedDelegators(resolveBakerRewards(args))
      )
    );

    mockProvider.mockResolvedValue(
      partialInput.cycleReport.delegatorPayments.map(() => ({
        totalCost: 1,
      }))
    );

    const inputWithTransactionFees = await resolveEstimateTransactionFees(
      partialInput
    );

    const input = resolveExcludedPaymentsByMinimumDelegatorBalance(
      resolveExcludedPaymentsByMinimumAmount(inputWithTransactionFees)
    );

    const output = resolveSubstractTransactionFees(input);

    const inputPayments = input.cycleReport.delegatorPayments;
    const outputPayments = output.cycleReport.delegatorPayments;

    /* Sanity check */
    expect(inputPayments.length).toEqual(outputPayments.length);

    for (let i = 0; i < inputPayments.length; i++) {
      expect(outputPayments[i].transactionFeePaidBy).toEqual(
        EFeePayer.Delegator
      );
      expect(outputPayments[i].amount).toStrictEqual(
        inputPayments[i].amount.minus(1)
      );
    }

    const expectedFeesPaid = new BigNumber(
      outputPayments.length
    ); /* 1 mutez per payment */
    expect(output.cycleReport.feesPaid).toStrictEqual(expectedFeesPaid);

    expect(output.cycleReport.feeIncome).toEqual(input.cycleReport.feeIncome);
  });
});
