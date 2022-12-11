/** @jest-environment setup-polly-jest/jest-environment-node */
import { TezosToolkit } from "@taquito/taquito";

import client from "src/api-client";

import {
  resolveBakerRewards,
  resolveExcludedDelegators,
  resolveDelegatorRewards,
  resolveExcludedPaymentsByContext,
  resolveEstimateTransactionFees,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveSubstractTransactionFees,
} from "src/engine/steps";

import engine from "src/engine";
import * as helpers from "src/engine/helpers";

import * as Polly from "test/helpers/polly";
import { generateConfig } from "test/helpers";
import { resolveDonations } from "src/engine/steps/resolveDonations";
import BigNumber from "bignumber.js";

const { initializeCycleReport } = helpers;

describe("resolveSufficientBalance", () => {
  Polly.start();
  const provider = new TezosToolkit("https://ghostnet.ecadinfra.com");

  let mockProvider;
  let mockProviderRpcConstants;

  const inputSteps = [
    resolveBakerRewards,
    resolveExcludedDelegators,
    resolveDelegatorRewards,
    resolveExcludedPaymentsByContext,
    resolveEstimateTransactionFees,
    resolveExcludedPaymentsByMinimumAmount,
    resolveExcludedPaymentsByMinimumDelegatorBalance,
    resolveSubstractTransactionFees,
  ];

  beforeEach(() => {
    mockProvider = jest.spyOn(provider.estimate, "batch");
    mockProviderRpcConstants = jest.spyOn(provider.rpc, "getConstants");

    mockProviderRpcConstants.mockResolvedValue({
      /* Realistic numbers */
      hard_gas_limit_per_operation: 1040000,
      hard_storage_limit_per_operation: 60000,
    });

    mockProvider.mockResolvedValue(
      Array.from(
        {
          length: 50,
        },
        () => ({
          gasLimit: 1,
          storageLimit: 1,
          suggestedFeeMutez: 1,
        })
      )
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("does not update the arguments object if no donation addresses are provided", async () => {
    const config = generateConfig();

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

    const input = await engine.run(args, inputSteps);

    const output = await resolveDonations(input);

    expect(input).toStrictEqual(output);
  });

  it("correctly adds payments for given donation addresses and percentages", async () => {
    const donationRecipients = {
      tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof: 2,
      tz1iCYywbfJEjb1h5Ew6hR8tr7CnbLVRWogm: 3,
    };

    const config = generateConfig({
      donations: donationRecipients,
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

    const input = await engine.run(args, inputSteps);

    const {
      cycleReport: { donationPayments },
    } = resolveDonations(input);
    for (const payment of donationPayments) {
      const share = donationRecipients[payment.recipient] / 100;

      const feeIncomeAmount = new BigNumber(share).times(
        input.cycleReport.feeIncome
      );

      const bondRewardAmount = new BigNumber(share).times(
        input.cycleReport.lockedBondRewards
      );
      const totalAmount = bondRewardAmount
        .plus(feeIncomeAmount)
        .dp(0, BigNumber.ROUND_DOWN);

      expect(payment.amount).toStrictEqual(totalAmount);
    }
  });

  it("correctly deducts donations from distributable bond rewards and fee income", async () => {
    const donationRecipients = {
      tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof: 2,
      tz1iCYywbfJEjb1h5Ew6hR8tr7CnbLVRWogm: 3,
    };

    const config = generateConfig({
      donations: donationRecipients,
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

    const input = await engine.run(args, inputSteps);
    const output = resolveDonations(input);

    const {
      cycleReport: { donationPayments },
    } = resolveDonations(input);

    let totalFeeIncomeDonation = new BigNumber(0);
    let totalBondRewardDonation = new BigNumber(0);

    for (const payment of donationPayments) {
      const share = donationRecipients[payment.recipient] / 100;

      const feeIncomeAmount = new BigNumber(share).times(
        input.cycleReport.feeIncome
      );

      const bondRewardAmount = new BigNumber(share).times(
        input.cycleReport.lockedBondRewards
      );

      totalBondRewardDonation = totalBondRewardDonation
        .plus(bondRewardAmount)
        .dp(0, BigNumber.ROUND_DOWN);
      totalFeeIncomeDonation = totalFeeIncomeDonation
        .plus(feeIncomeAmount)
        .dp(0, BigNumber.ROUND_DOWN);
    }

    expect(output.cycleReport.feeIncome).toEqual(
      input.cycleReport.feeIncome.minus(totalFeeIncomeDonation)
    );
    expect(output.cycleReport.lockedBondRewards).toEqual(
      input.cycleReport.lockedBondRewards.minus(totalBondRewardDonation)
    );
  });
});
