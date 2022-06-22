/** @jest-environment setup-polly-jest/jest-environment-node */
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
  resolveSplitIntoBatches,
  resolveFeeIncomeDistribution,
  resolveBondRewardDistribution,
} from "src/engine/steps";

import { initializeCycleReport } from "src/engine/helpers";

import * as Polly from "test/helpers/polly";
import { generateConfig } from "test/helpers";

describe("resolveSplitIntoBatches", () => {
  Polly.start();
  const provider = new TezosToolkit("https://ithacanet.ecadinfra.com");

  let mockProviderEstimateBatch;
  let mockProviderRpcConstants;

  beforeEach(() => {
    mockProviderEstimateBatch = jest.spyOn(provider.estimate, "batch");
    mockProviderRpcConstants = jest.spyOn(provider.rpc, "getConstants");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("produces separate batches for delegator, fee income and bond reward payments at a minimum", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      fee_income_recipients: { [recipientAddress]: "1" },
      bond_reward_recipients: { [recipientAddress]: "1" },
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

    mockProviderEstimateBatch.mockResolvedValue(
      partialInput.cycleReport.delegatorPayments.map((_item, index) => ({
        /* Arbitrary numbers to make sure that all transactions fit into a single batch */
        totalCost: 1,
        storageLimit: 1,
        gasLimit: 1,
      }))
    );

    const inputWithTransactionFees = await resolveEstimateTransactionFees(
      partialInput
    );

    const input = resolveSubstractTransactionFees(
      resolveExcludedPaymentsByMinimumDelegatorBalance(
        resolveExcludedPaymentsByMinimumAmount(inputWithTransactionFees)
      )
    );

    mockProviderRpcConstants.mockResolvedValue({
      /* Realistic numbers */
      hard_gas_limit_per_operation: 1040000,
      hard_storage_limit_per_operation: 60000,
    });

    const output = await resolveSplitIntoBatches(
      resolveBondRewardDistribution(resolveFeeIncomeDistribution(input))
    );

    const {
      cycleReport: { batches },
    } = output;

    expect(batches).toHaveLength(3);
    expect(batches[0]).toStrictEqual(input.cycleReport.delegatorPayments);

    expect(batches[1]).toHaveLength(1);
    expect(batches[1][0].recipient).toEqual(recipientAddress);

    expect(batches[2]).toHaveLength(1);
    expect(batches[2][0].recipient).toEqual(recipientAddress);
  });

  it("adds delegator payments to a given batch up to the hard gas limit", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      fee_income_recipients: { [recipientAddress]: "1" },
      bond_reward_recipients: { [recipientAddress]: "1" },
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

    mockProviderEstimateBatch.mockResolvedValue(
      partialInput.cycleReport.delegatorPayments.map((_item, index) => ({
        totalCost: 1,
        storageLimit: 2,
        gasLimit: 2,
      }))
    );

    const inputWithTransactionFees = await resolveEstimateTransactionFees(
      partialInput
    );

    const input = resolveSubstractTransactionFees(
      resolveExcludedPaymentsByMinimumDelegatorBalance(
        resolveExcludedPaymentsByMinimumAmount(inputWithTransactionFees)
      )
    );

    mockProviderRpcConstants.mockResolvedValue({
      /* No more than one operation per batch operation gasLimit is 2 */
      hard_gas_limit_per_operation: 3,
      /* Set storage limit to a high number in order to isolate the gas limit */
      hard_storage_limit_per_operation: 1000000,
    });

    const output = await resolveSplitIntoBatches(
      resolveBondRewardDistribution(resolveFeeIncomeDistribution(input))
    );

    const {
      cycleReport: { batches, delegatorPayments },
    } = output;

    expect(batches.length).toEqual(delegatorPayments.length + 2);

    expect(batches[7][0].recipient).toEqual(recipientAddress);
    expect(batches[8][0].recipient).toEqual(recipientAddress);

    for (let i = 0; i < batches.length - 2; i++) {
      expect(batches[i][0]).toStrictEqual(delegatorPayments[i]);
    }
  });
  it("adds delegator payments to a given batch up to the hard storage limit", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      fee_income_recipients: { [recipientAddress]: "1" },
      bond_reward_recipients: { [recipientAddress]: "1" },
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

    mockProviderEstimateBatch.mockResolvedValue(
      partialInput.cycleReport.delegatorPayments.map((_item, index) => ({
        totalCost: 1,
        storageLimit: 2,
        gasLimit: 2,
      }))
    );

    const inputWithTransactionFees = await resolveEstimateTransactionFees(
      partialInput
    );

    const input = resolveSubstractTransactionFees(
      resolveExcludedPaymentsByMinimumDelegatorBalance(
        resolveExcludedPaymentsByMinimumAmount(inputWithTransactionFees)
      )
    );

    mockProviderRpcConstants.mockResolvedValue({
      /* Set storage limit to a high number in order to isolate the storage limit */
      hard_gas_limit_per_operation: 1000000,
      /* No more than one operation per batch as operation storageLimit is 2 */
      hard_storage_limit_per_operation: 3,
    });

    const output = await resolveSplitIntoBatches(
      resolveBondRewardDistribution(resolveFeeIncomeDistribution(input))
    );

    const {
      cycleReport: { batches, delegatorPayments },
    } = output;

    expect(batches.length).toEqual(delegatorPayments.length + 2);

    expect(batches[7][0].recipient).toEqual(recipientAddress);
    expect(batches[8][0].recipient).toEqual(recipientAddress);

    for (let i = 0; i < batches.length - 2; i++) {
      expect(batches[i][0]).toStrictEqual(delegatorPayments[i]);
    }
  });
});
