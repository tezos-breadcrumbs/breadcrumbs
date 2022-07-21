/** @jest-environment setup-polly-jest/jest-environment-node */
import { TezosToolkit } from "@taquito/taquito";
import { map } from "lodash";

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
  resolveFeeIncomeDistribution,
  resolveBondRewardDistribution,
  resolveSplitIntoBatches,
  resolveSufficientBalance,
} from "src/engine/steps";

import engine from "src/engine";
import * as helpers from "src/engine/helpers";
import { sum } from "src/utils/math";

import * as Polly from "test/helpers/polly";
import { generateConfig } from "test/helpers";

const { initializeCycleReport } = helpers;

describe("resolveSufficientBalance", () => {
  Polly.start();
  const provider = new TezosToolkit("https://ghostnet.ecadinfra.com");

  let mockProvider;
  let mockProviderRpcConstants;
  let mockGetSignerBalance;

  const inputSteps = [
    resolveBakerRewards,
    resolveExcludedDelegators,
    resolveDelegatorRewards,
    resolveExcludedPaymentsByContext,
    resolveEstimateTransactionFees,
    resolveExcludedPaymentsByMinimumAmount,
    resolveExcludedPaymentsByMinimumDelegatorBalance,
    resolveSubstractTransactionFees,
    resolveFeeIncomeDistribution,
    resolveBondRewardDistribution,
    // resolveExcludeDistributed,
    resolveSplitIntoBatches,
  ];

  beforeEach(() => {
    mockProvider = jest.spyOn(provider.estimate, "batch");
    mockProviderRpcConstants = jest.spyOn(provider.rpc, "getConstants");
    mockGetSignerBalance = jest.spyOn(helpers, "getSignerBalance");

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

  it("does not update flag if the payout wallet balance exceeds the total payable amount by at least 10%", async () => {
    const config = generateConfig({});

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

    const totalPayable = sum(
      ...map(
        [
          ...input.cycleReport.delegatorPayments,
          ...input.cycleReport.feeIncomePayments,
          ...input.cycleReport.bondRewardPayments,
        ],
        (p) => p.amount
      )
    );

    const requiredBalance = totalPayable.times(1.1);
    mockGetSignerBalance.mockResolvedValue(requiredBalance);

    const output = await resolveSufficientBalance(input);

    expect(output.flags).toStrictEqual({});
  });

  it("updates flag if the payout wallet balance is less than the total payable amount adjusted upwards by 10%", async () => {
    const config = generateConfig({});

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

    const totalPayable = sum(
      ...map(
        [
          ...input.cycleReport.delegatorPayments,
          ...input.cycleReport.feeIncomePayments,
          ...input.cycleReport.bondRewardPayments,
        ],
        (p) => p.amount
      )
    );

    const requiredBalance = totalPayable.times(1.01);
    mockGetSignerBalance.mockResolvedValue(requiredBalance.minus(1));

    const output = await resolveSufficientBalance(input);
    expect(output.flags).toStrictEqual({ insufficientBalance: true });
  });
});
