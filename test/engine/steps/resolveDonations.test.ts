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
  resolveSufficientBalance,
} from "src/engine/steps";

import engine from "src/engine";
import * as helpers from "src/engine/helpers";
import { sum } from "src/utils/math";

import * as Polly from "test/helpers/polly";
import { generateConfig } from "test/helpers";
import { resolveDonations } from "src/engine/steps/resolveDonations";

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

  it("correctly adds payment for every donation address and amount provided", async () => {
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

  it("does not update object if no donation addresses are provided", async () => {
    const config = generateConfig({
      donations: { tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU: 2 },
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

    const output = await resolveDonations(input);

    console.log(output.cycleReport.donationPayments);
  });
});
