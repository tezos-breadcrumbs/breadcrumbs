/** @jest-environment setup-polly-jest/jest-environment-node */

import _ from "lodash";
import BigNumber from "bignumber.js";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
  resolveFeeIncomeDistribution,
} from "src/engine/steps";

import { initializeCycleReport } from "src/engine/helpers";

describe("resolveFeeIncomeDistrubtion", () => {
  Polly.start();

  it("should not add any payments if no fee_income_recipients are given", async () => {
    const config = generateConfig({ fee_income_recipients: {} });
    const cycleReport = initializeCycleReport(470);
    const cycleData = await client.getCycleData(config.baking_address, 470);

    const { cycleRewards: distributableRewards } = cycleData;

    const args = {
      config,
      cycleData,
      cycleReport,
      distributableRewards,
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const output = resolveFeeIncomeDistribution(input);

    expect(output).toStrictEqual(input);
  });

  it("should create a payment equivalent to fee income if one fee_income_recipient is given", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      fee_income_recipients: { [recipientAddress]: "1" },
    });

    const cycleData = await client.getCycleData(config.baking_address, 470);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleData.cycleRewards,
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const {
      cycleReport: { feeIncomePayments },
    } = resolveFeeIncomeDistribution(input);

    expect(feeIncomePayments).toHaveLength(1);
    expect(feeIncomePayments[0].recipient).toEqual(recipientAddress);
    expect(feeIncomePayments[0].amount).toEqual(input.cycleReport.feeIncome);
  });

  it("should split payments correctly if multiple fee_income_recipients are given", async () => {
    const fee_income_recipients = {
      tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof: "0.4",
      tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur: "0.6",
    };
    const config = generateConfig({ fee_income_recipients });
    const cycleReport = initializeCycleReport(470);
    const cycleData = await client.getCycleData(config.baking_address, 470);

    const { cycleRewards: distributableRewards } = cycleData;

    const args = {
      config,
      cycleData,
      cycleReport,
      distributableRewards,
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const {
      cycleReport: { feeIncomePayments },
    } = resolveFeeIncomeDistribution(input);

    expect(feeIncomePayments).toHaveLength(2);

    for (const payment of feeIncomePayments) {
      const amount = new BigNumber(fee_income_recipients[payment.recipient])
        .times(input.cycleReport.feeIncome)
        .dp(0, BigNumber.ROUND_DOWN);

      expect(payment.amount).toStrictEqual(amount);
    }
  });
});
