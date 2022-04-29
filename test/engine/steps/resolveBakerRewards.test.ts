/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";

import client from "src/client";
import { generateConfig } from "test/helpers";
import { initializeCycleReport, isOverDelegated } from "src/engine/helpers";
import { resolveBakerRewards } from "src/engine/steps/resolveBakerRewards";
import { subtract } from "src/utils/math";

import * as Polly from "test/helpers/polly";

describe("resolveBakerRewards", () => {
  Polly.start();

  test("adds baker stake to `cycleShares` for regular processing if not overdelegated", async () => {
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
    };

    const lockedBondRewards = bakerBalance
      .div(cycleStakingBalance)
      .times(cycleRewards);

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

  test("adds baker stake to `cycleShares` for regular processing if overdelegated and `overdelegation_guard` is false", async () => {
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
    };

    const lockedBondRewards = bakerBalance
      .div(cycleStakingBalance)
      .times(cycleRewards);

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

  test("allocates 10% of rewards to baker if overdelegated and `overdelegation_guard` is true  (case: frozen deposit limit)", async () => {
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
    };

    const actual = resolveBakerRewards(args);

    const expected = {
      ...args,
      cycleReport: {
        ...args.cycleReport,
        lockedBondRewards: cycleRewards.div(10),
      },
      distributableRewards: cycleRewards.minus(cycleRewards.div(10)),
    };

    expect(actual).toStrictEqual(expected);

    const bakerIncludedInShares = _.some(actual.cycleData.cycleShares, {
      address: config.baking_address,
    });

    expect(bakerIncludedInShares).toBe(false);
  });

  test("allocates 10% of rewards to baker if overdelegated and `overdelegation_guard` is true  (case: actual stake)", async () => {
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
    };

    const actual = resolveBakerRewards(args);

    const expected = {
      ...args,
      cycleReport: {
        ...args.cycleReport,
        lockedBondRewards: cycleRewards.div(10),
      },
      distributableRewards: cycleRewards.minus(cycleRewards.div(10)),
    };

    expect(actual).toStrictEqual(expected);

    const bakerIncludedInShares = _.some(actual.cycleData.cycleShares, {
      address: config.baking_address,
    });

    expect(bakerIncludedInShares).toBe(false);
  });
});
