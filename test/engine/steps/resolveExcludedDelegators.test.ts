/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";

import client from "src/client";
import { generateConfig } from "test/helpers";
import { initializeCycleReport, isOverDelegated } from "src/engine/helpers";
import { resolveExcludedDelegators } from "src/engine/steps/resolveExcludedDelegators";
import { subtract } from "src/utils/math";

import * as Polly from "test/helpers/polly";

describe("resolveExcludedDelegators", () => {
  Polly.start();

  it("removes excluded delegators from cycleShares", async () => {
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
