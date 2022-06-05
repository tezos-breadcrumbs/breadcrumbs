/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import { initializeCycleReport } from "src/engine/helpers";
import {
  resolveExcludedDelegators,
  resolveBakerRewards,
} from "src/engine/steps";

describe("resolveExcludedDelegators", () => {
  Polly.start();

  it("does not alter the input object if there are no excluded addresses", async () => {
    const excludedAddresses = [];
    const config = generateConfig({
      overdelegation_blacklist: excludedAddresses,
    });

    const cycleData = await client.getCycleData(config.baking_address, 470);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleData.cycleRewards,
    };

    const input = resolveBakerRewards(args);
    const output = resolveExcludedDelegators(input);

    expect(output).toStrictEqual(input);
  });

  it("removes excluded delegators from cycleShares if excluded address are specified", async () => {
    const excludedAddresses = [
      "KT1T9jvz4nPq6JkssNwXFPiReVgoX88bNwpH",
      "tz1M1dgUJooWnzYhb8MnWin6MkQrPA55TTCr",
    ];
    const config = generateConfig({
      overdelegation_blacklist: excludedAddresses,
    });

    const cycleData = await client.getCycleData(config.baking_address, 470);
    const { cycleRewards, cycleShares } = cycleData;

    const numberOfDelegators = cycleShares.length;

    expect(numberOfDelegators).toEqual(9);
    /* Sentry & Legate has 9 delegators in cycle 470 */

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleRewards,
    };

    const actual = resolveExcludedDelegators(args);

    expect(actual.cycleData.cycleShares).toHaveLength(
      numberOfDelegators - excludedAddresses.length
    );
    expect(
      _.some(actual.cycleData.cycleShares, ["address", excludedAddresses[0]])
    ).toBeFalsy();
    expect(
      _.some(actual.cycleData.cycleShares, ["address", excludedAddresses[1]])
    ).toBeFalsy();

    expect(actual).toStrictEqual({
      ...args,
      cycleData: {
        ...args.cycleData,
        cycleShares: _.reject(args.cycleData.cycleShares, (share) =>
          _.includes(config.overdelegation_blacklist, share.address)
        ),
      },
    });
  });
});
