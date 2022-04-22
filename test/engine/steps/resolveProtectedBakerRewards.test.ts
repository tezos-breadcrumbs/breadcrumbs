/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";

import client from "src/client";
import { generateConfig } from "test/helpers";
import { initializeCycleReport } from "src/engine/helpers";
import { resolveProtectedBakerRewards } from "src/engine/steps/resolveProtectedBakerRewards";
import { subtract } from "src/utils/math";

import * as Polly from "test/helpers/polly";

describe("resolveProtectedBakerRewards", () => {
  Polly.start();

  test("adds baker stake to cycleShares if overdelegation_guard is false", async () => {
    const config = generateConfig();
    const cycleData = await client.getCycleData(config.baking_address, 470);

    const bakerIncludedInShares = _.some(cycleData.cycleShares, {
      address: config.baking_address,
    });

    expect(bakerIncludedInShares).toBe(false);

    const bakerBalance = subtract(
      cycleData.cycleStakingBalance,
      cycleData.cycleDelegatedBalance
    );

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleData.cycleRewards,
    };

    const actual = resolveProtectedBakerRewards(args);

    const expected = _.update(args, ["cycleData", "cycleShares"], (shares) =>
      shares.concat({ address: config.baking_address, balance: bakerBalance })
    );

    expect(actual).toStrictEqual(expected);
  });
});
