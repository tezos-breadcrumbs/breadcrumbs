/** @jest-environment setup-polly-jest/jest-environment-node */
import { TezosToolkit } from "@taquito/taquito";

import client from "src/api-client";

import engine from "src/engine";

import {
  resolveBakerRewards,
  resolveBondRewardDistribution,
  resolveDelegatorRewards,
  resolveDonations,
  resolveEstimateTransactionFees,
  resolveExcludedDelegators,
  resolveExcludedPaymentsByContext,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveFeeIncomeDistribution,
  resolveSplitIntoBatches,
  resolveSubstractTransactionFees,
} from "src/engine/steps";

import { initializeCycleReport } from "src/engine/helpers";

import * as Polly from "test/helpers/polly";
import { generateConfig } from "test/helpers";

describe("resolveSplitIntoBatches", () => {
  Polly.start();
  const provider = new TezosToolkit("https://ghostnet.ecadinfra.com");

  let mockProviderEstimateBatch;
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
    resolveDonations,
    resolveFeeIncomeDistribution,
    resolveBondRewardDistribution,
  ];

  beforeEach(() => {
    mockProviderEstimateBatch = jest.spyOn(provider.estimate, "batch");
    mockProviderRpcConstants = jest.spyOn(provider.rpc, "getConstants");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("produces five batches at a minimum (tz delegator, KT delegator, fee income, bond rewards, donations)", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      donations: {
        [recipientAddress]: 1,
      },
      income_recipients: {
        fee_income: {
          [recipientAddress]: 1,
        },
        bond_rewards: {
          [recipientAddress]: 1,
        },
      },
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
      flags: {},
    };

    mockProviderEstimateBatch.mockImplementation((payments) =>
      payments.map((_item) => ({
        gasLimit: 1,
        storageLimit: 1,
        suggestedFeeMutez: 1,
      }))
    );

    mockProviderRpcConstants.mockResolvedValue({
      /* Realistic numbers */
      hard_gas_limit_per_operation: 1040000,
      hard_storage_limit_per_operation: 60000,
    });

    const input = await engine.run(args, inputSteps);

    const output = await resolveSplitIntoBatches(input);

    const {
      cycleReport: { batches },
    } = output;

    expect(batches).toHaveLength(5);
    expect(batches[0]).toStrictEqual(
      input.cycleReport.delegatorPayments.filter((p) =>
        p.recipient.startsWith("tz")
      )
    );

    expect(batches[1]).toStrictEqual(
      input.cycleReport.delegatorPayments.filter((p) =>
        p.recipient.startsWith("KT")
      )
    );

    expect(batches[2]).toHaveLength(1);
    expect(batches[2][0].recipient).toEqual(recipientAddress);

    expect(batches[3]).toHaveLength(1);
    expect(batches[3][0].recipient).toEqual(recipientAddress);

    expect(batches[4]).toHaveLength(1);
    expect(batches[4][0].recipient).toEqual(recipientAddress);
  });

  it("adds delegator payments to a given batch up to the hard gas limit", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      donations: {
        [recipientAddress]: 1,
      },
      income_recipients: {
        fee_income: {
          [recipientAddress]: 1,
        },
        bond_rewards: {
          [recipientAddress]: 1,
        },
      },
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
      flags: {},
    };

    mockProviderEstimateBatch.mockImplementation((payments) =>
      payments.map((_item) => ({
        suggestedFeeMutez: 1,
        storageLimit: 2,
        gasLimit: 2,
      }))
    );

    mockProviderRpcConstants.mockResolvedValue({
      /* No more than one operation per batch operation gasLimit is 2 */
      hard_gas_limit_per_operation: 3,
      /* Set storage limit to a high number in order to isolate the gas limit */
      hard_storage_limit_per_operation: 1000000,
    });

    const input = await engine.run(args, inputSteps);
    const output = await resolveSplitIntoBatches(input);

    const {
      cycleReport: { batches, delegatorPayments },
    } = output;

    expect(batches.length).toEqual(delegatorPayments.length + 3);

    expect(batches[batches.length - 1][0].recipient).toEqual(recipientAddress);
    expect(batches[batches.length - 2][0].recipient).toEqual(recipientAddress);
    expect(batches[batches.length - 3][0].recipient).toEqual(recipientAddress);

    for (let i = 0; i < batches.length - 3; i++) {
      expect(batches[i].length === 1);
    }
  });
  it("adds delegator payments to a given batch up to the hard storage limit", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      donations: {
        [recipientAddress]: 1,
      },
      income_recipients: {
        fee_income: {
          [recipientAddress]: 1,
        },
        bond_rewards: {
          [recipientAddress]: 1,
        },
      },
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
      flags: {},
    };

    mockProviderEstimateBatch.mockImplementation((payments) =>
      payments.map((_item) => ({
        suggestedFeeMutez: 1,
        storageLimit: 2,
        gasLimit: 2,
      }))
    );

    mockProviderRpcConstants.mockResolvedValue({
      /* Set storage limit to a high number in order to isolate the storage limit */
      hard_gas_limit_per_operation: 1000000,
      /* No more than one operation per batch as operation storageLimit is 2 */
      hard_storage_limit_per_operation: 3,
    });

    const input = await engine.run(args, inputSteps);
    const output = await resolveSplitIntoBatches(input);

    const {
      cycleReport: { batches, delegatorPayments },
    } = output;

    expect(batches.length).toEqual(delegatorPayments.length + 3);
    expect(batches[batches.length - 1][0].recipient).toEqual(recipientAddress);
    expect(batches[batches.length - 2][0].recipient).toEqual(recipientAddress);
    expect(batches[batches.length - 3][0].recipient).toEqual(recipientAddress);

    for (let i = 0; i < batches.length - 3; i++) {
      expect(batches[i]).toHaveLength(1);
    }
  });
});
