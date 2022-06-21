/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";
import BigNumber from "bignumber.js";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import { initializeCycleReport, isOverDelegated } from "src/engine/helpers";
import { resolveBakerRewards } from "src/engine/steps";
import { subtract } from "src/utils/math";
import { TezosToolkit } from "@taquito/taquito";

describe("resolveBakerRewards", () => {
  Polly.start();

  test("allocates to proportional rewards to baker if not overdelegated", async () => {
    const config = generateConfig({ overdelegation_guard: true });
    const cycleData = await client.getCycleData(config.baking_address, 470);
    const {
      cycleShares,
      cycleStakingBalance,
      cycleRewards,
      cycleDelegatedBalance,
      frozenDepositLimit,
    } = cycleData;

    const bakerIncludedInShares = _.some(cycleShares, {
      address: config.baking_address,
    });

    expect(bakerIncludedInShares).toBe(false);

    const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);

    expect(
      isOverDelegated(bakerBalance, cycleStakingBalance, frozenDepositLimit)
    ).toBe(false);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleData.cycleRewards,
      tezos: {} as TezosToolkit,
    };

    const lockedBondRewards = bakerBalance
      .div(cycleStakingBalance)
      .times(cycleRewards)
      .dp(0, BigNumber.ROUND_DOWN);

    const distributableRewards =
      args.distributableRewards.minus(lockedBondRewards);

    const actual = resolveBakerRewards(args);

    const expected = {
      ...args,
      cycleReport: {
        ...args.cycleReport,
        lockedBondRewards,
      },
      distributableRewards,
    };

    expect(actual).toStrictEqual(expected);
    expect(
      actual.distributableRewards.plus(actual.cycleReport.lockedBondRewards)
    ).toStrictEqual(actual.cycleData.cycleRewards);
  });

  test("allocates proportional rewards to baker if overdelegated and `overdelegation_guard` is false", async () => {
    const config = generateConfig({
      baking_address: "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof" /* Tezos Rio */,
      overdelegation_guard: false,
    });

    const cycleData = await client.getCycleData(config.baking_address, 475);
    const {
      cycleShares,
      cycleStakingBalance,
      cycleDelegatedBalance,
      frozenDepositLimit,
      cycleRewards,
    } = cycleData;

    const bakerIncludedInShares = _.some(cycleShares, {
      address: config.baking_address,
    });

    expect(bakerIncludedInShares).toBe(false);

    const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);

    /* Tezos Rio is overdelegated based on a frozen deposit limit in cycle 475 */
    expect(
      isOverDelegated(bakerBalance, cycleStakingBalance, frozenDepositLimit)
    ).toBe(true);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleData.cycleRewards,
      tezos: {} as TezosToolkit,
    };

    const lockedBondRewards = bakerBalance
      .div(cycleStakingBalance)
      .times(cycleRewards)
      .dp(0, BigNumber.ROUND_DOWN);

    const distributableRewards =
      args.distributableRewards.minus(lockedBondRewards);

    const actual = resolveBakerRewards(args);

    const expected = {
      ...args,
      cycleReport: {
        ...args.cycleReport,
        lockedBondRewards,
      },
      distributableRewards,
    };

    expect(actual).toStrictEqual(expected);
    expect(
      actual.distributableRewards.plus(actual.cycleReport.lockedBondRewards)
    ).toStrictEqual(actual.cycleData.cycleRewards);
  });

  test("allocates 10% of rewards to baker if overdelegated and `overdelegation_guard` is true  (frozen deposit limit)", async () => {
    const config = generateConfig({
      baking_address: "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof" /* Tezos Rio */,
      overdelegation_guard: true,
    });

    const cycleData = await client.getCycleData(config.baking_address, 475);
    const {
      cycleStakingBalance,
      cycleDelegatedBalance,
      frozenDepositLimit,
      cycleRewards,
    } = cycleData;

    const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);

    /* Tezos Rio is overdelegated based on a frozen deposit limit in cycle 475 */
    expect(
      isOverDelegated(bakerBalance, cycleStakingBalance, frozenDepositLimit)
    ).toBe(true);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(475),
      distributableRewards: cycleData.cycleRewards,
      tezos: {} as TezosToolkit,
    };

    const actual = resolveBakerRewards(args);

    const lockedBondRewards = cycleRewards.div(10).dp(0, BigNumber.ROUND_DOWN);

    const expected = {
      ...args,
      cycleReport: {
        ...args.cycleReport,
        lockedBondRewards,
      },
      distributableRewards: cycleRewards.minus(lockedBondRewards),
    };

    expect(actual).toStrictEqual(expected);

    const bakerIncludedInShares = _.some(actual.cycleData.cycleShares, {
      address: config.baking_address,
    });

    expect(bakerIncludedInShares).toBe(false);
  });

  test("allocates 10% of rewards to baker if overdelegated and `overdelegation_guard` is true  (actual stake)", async () => {
    const config = generateConfig({
      baking_address:
        "tz1axcnVN9tZnCe4sQQhC6f3tfSEXdjPaXPY" /* Devil's Delegate */,
      overdelegation_guard: true,
    });

    const cycleData = await client.getCycleData(config.baking_address, 476);
    const {
      cycleStakingBalance,
      cycleDelegatedBalance,
      frozenDepositLimit,
      cycleRewards,
    } = cycleData;

    const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);

    /* Devil's Delegated is overdelegated based on actual bond in cycle 476 */
    expect(
      isOverDelegated(bakerBalance, cycleStakingBalance, frozenDepositLimit)
    ).toBe(true);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(476),
      distributableRewards: cycleData.cycleRewards,
      tezos: {} as TezosToolkit,
    };

    const actual = resolveBakerRewards(args);
    const lockedBondRewards = cycleRewards.div(10).dp(0, BigNumber.ROUND_DOWN);

    const expected = {
      ...args,
      cycleReport: {
        ...args.cycleReport,
        lockedBondRewards,
      },
      distributableRewards: cycleRewards.minus(lockedBondRewards),
    };

    expect(actual).toStrictEqual(expected);

    const bakerIncludedInShares = _.some(actual.cycleData.cycleShares, {
      address: config.baking_address,
    });

    expect(bakerIncludedInShares).toBe(false);
  });
});
