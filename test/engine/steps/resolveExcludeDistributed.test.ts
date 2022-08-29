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
  resolveFeeIncomeDistribution,
  resolveBondRewardDistribution,
} from "src/engine/steps";

import engine from "src/engine";
import * as helpers from "src/engine/helpers";

import * as fsClient from "src/fs-client";
import * as Polly from "test/helpers/polly";
import { generateConfig } from "test/helpers";

const { initializeCycleReport } = helpers;

describe("resolveSufficientBalance", () => {
  Polly.start();
  const provider = new TezosToolkit("https://ghostnet.ecadinfra.com");

  let mockProvider;
  let mockProviderRpcConstants;
  let mockReadPaymentReport;

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
  ];

  beforeEach(() => {
    mockProvider = jest.spyOn(provider.estimate, "batch");
    mockProviderRpcConstants = jest.spyOn(provider.rpc, "getConstants");
    mockReadPaymentReport = jest.spyOn(fsClient, "readPaymentReport");

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

  it("returns correct arguments if there are no previous cycle records", async () => {
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
  });

  it("returns distributed payments correctly if applicable", async () => {
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
  });

  it("returns pending delegator payments correctly if previous distributions exist", async () => {
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
  });

  it("returns pending fee income payments correctly if previous distributions exist", async () => {
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
  });

  it("returns pending bond reward payments correctly if previous distributions exist", async () => {
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
  });

  it("correctly recognizes successful payments in the failed payments file", async () => {
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
  });

  it("includes payments previously excluded by script rejection for submission if they are not rejected again", async () => {
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
  });
});
