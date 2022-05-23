/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";
import BigNumber from "bignumber.js";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import { initializeCycleReport } from "src/engine/helpers";
import {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
  resolveExcludedPayments,
} from "src/engine/steps";

describe("resolveExcludedPayments", () => {
  Polly.start();

  it("does not exclude payments if minimum payment amount is set at zero", async () => {
    const config = generateConfig({
      minimum_payment_amount: "0",
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

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const actual = resolveExcludedPayments(input);

    expect(actual.cycleReport.payments).toStrictEqual(
      input.cycleReport.payments
    );

    expect(
      _.find(actual.cycleReport.payments, (payment) => payment.amount.eq(0))
    ).toBeUndefined();
  });

  it("exclude payments if they are below the specified minimum amount", async () => {
    const minimumPaymentAmount = new BigNumber("2");

    const config = generateConfig({
      minimum_payment_amount: minimumPaymentAmount.toString(),
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

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const output = resolveExcludedPayments(input);

    const {
      cycleReport: { payments: inputPayments },
    } = input;

    const {
      cycleReport: { payments: outputPayments },
    } = output;

    expect(
      _.filter(outputPayments, (payment) => payment.amount.eq(0)).length
    ).toBeGreaterThan(0);

    for (let i = 0; i < inputPayments.length; i++) {
      if (inputPayments[i].amount.lt(minimumPaymentAmount.times(1000000))) {
        expect(outputPayments[i].amount.eq(0));
      } else {
        expect(outputPayments[i]).toStrictEqual(inputPayments[i]);
      }
    }
  });
});
