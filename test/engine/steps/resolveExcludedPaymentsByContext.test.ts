/** @jest-environment setup-polly-jest/jest-environment-node */

import { find, startsWith } from "lodash";
import { TezosToolkit } from "@taquito/taquito";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedPaymentsByContext,
  resolveExcludedDelegators,
} from "src/engine/steps";

import { initializeCycleReport } from "src/engine/helpers";

describe("resolveExcludedPaymentsByContext", () => {
  Polly.start();

  it("excludes payments directed to the baking address", async () => {
    const DELEGATOR = "tz1TRSPwnJD6qv5LeE76uSQ1YppVEvzomFvS";
    const BAKER = "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur";

    const config = generateConfig({
      network_configuration: {
        rpc_url: "https://ghostnet.ecadinfra.com",
        suppress_KT_payments: false,
      },
      delegator_overrides: { [DELEGATOR]: { recipient: BAKER } },
    });

    const cycleReport = initializeCycleReport(470);
    const cycleData = await client.getCycleData(config.baking_address, 470);

    const { cycleRewards: distributableRewards } = cycleData;

    const args = {
      config,
      cycleData,
      cycleReport,
      distributableRewards,
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const output = resolveExcludedPaymentsByContext(input);

    /* Check one payment is excluded */
    expect(output.cycleReport.delegatorPayments.length).toEqual(
      input.cycleData.cycleShares.length - 1
    );

    expect(
      find(
        output.cycleReport.delegatorPayments,
        (p) => p.delegator === DELEGATOR
      )
    ).toBeUndefined();
  });

  it("excludes payments to KT addresses if this is configured", async () => {
    const config = generateConfig({
      network_configuration: {
        rpc_url: "https://ghostnet.ecadinfra.com",
        suppress_KT_payments: true,
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
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const output = resolveExcludedPaymentsByContext(input);

    /* Sentry & Legate had two payments to KT addresses in cycle 470 */
    expect(output.cycleReport.delegatorPayments.length).toEqual(
      input.cycleData.cycleShares.length - 2
    );

    expect(
      find(output.cycleReport.delegatorPayments, (p) =>
        startsWith(p.delegator, "KT")
      )
    ).toBeUndefined();
  });

  it("does not exclude payments to KT addresses if this is not configured", async () => {
    const config = generateConfig({
      network_configuration: {
        rpc_url: "https://ghostnet.ecadinfra.com",
        suppress_KT_payments: false,
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
      tezos: {} as TezosToolkit,
      flags: {},
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const output = resolveExcludedPaymentsByContext(input);

    /* Sentry & Legate had two payments to KT addresses in cycle 470 */
    expect(output.cycleReport.delegatorPayments.length).toEqual(
      input.cycleData.cycleShares.length
    );

    expect(
      find(output.cycleReport.delegatorPayments, (p) =>
        startsWith(p.delegator, "KT")
      )
    ).toBeDefined();
  });
});
