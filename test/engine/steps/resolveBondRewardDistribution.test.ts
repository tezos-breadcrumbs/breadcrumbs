/** @jest-environment setup-polly-jest/jest-environment-node */

import BigNumber from "bignumber.js";
import { TezosToolkit } from "@taquito/taquito";

import client from "src/api-client";
import * as Polly from "test/helpers/polly";

import { generateConfig } from "test/helpers";
import {
  resolveBakerRewards,
  resolveBondRewardDistribution,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
} from "src/engine/steps";

import { initializeCycleReport } from "src/engine/helpers";
import { EPaymentType } from "src/engine/interfaces";

describe("resolveBondRewardDistribution", () => {
  Polly.start();

  it("should not add any payments if no bond_reward_recipients are given", async () => {
    const config = generateConfig({
      income_recipients: {
        bond_rewards: {},
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
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const output = resolveBondRewardDistribution(input);

    expect(output).toStrictEqual(input);
    expect(output.cycleReport.bondRewardPayments).toHaveLength(0);
  });

  it("should create a payment equivalent to bond-associated rewards if one bond_reward_recipients is given", async () => {
    const recipientAddress = "tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof";
    const config = generateConfig({
      income_recipients: {
        bond_rewards: { [recipientAddress]: 1 },
      },
    });

    const cycleData = await client.getCycleData(config.baking_address, 470);

    const args = {
      config,
      cycleData,
      cycleReport: initializeCycleReport(470),
      distributableRewards: cycleData.cycleRewards,
      tezos: {} as TezosToolkit,
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const {
      cycleReport: { bondRewardPayments },
    } = resolveBondRewardDistribution(input);

    expect(bondRewardPayments).toHaveLength(1);
    expect(bondRewardPayments[0].type).toEqual(EPaymentType.BondReward);
    expect(bondRewardPayments[0].recipient).toEqual(recipientAddress);
    expect(bondRewardPayments[0].amount).toEqual(
      input.cycleReport.lockedBondRewards
    );
  });

  it("should split payments correctly if multiple bond_reward_recipients are given", async () => {
    const bondRewardRecipients = {
      tz1cZfFQpcYhwDp7y1njZXDsZqCrn2NqmVof: 0.4,
      tz1iCYywbfJEjb1h5Ew6hR8tr7CnbLVRWogm: 0.6,
    };
    const config = generateConfig({
      income_recipients: {
        bond_rewards: { ...bondRewardRecipients },
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
    };

    const input = resolveDelegatorRewards(
      resolveExcludedDelegators(resolveBakerRewards(args))
    );

    const {
      cycleReport: { bondRewardPayments },
    } = resolveBondRewardDistribution(input);

    expect(bondRewardPayments).toHaveLength(2);

    let paymentSum = new BigNumber(0);
    for (const payment of bondRewardPayments) {
      const share = bondRewardRecipients[payment.recipient];
      const amount = new BigNumber(share)
        .times(input.cycleReport.lockedBondRewards)
        .dp(0, BigNumber.ROUND_DOWN);

      paymentSum = paymentSum.plus(amount);

      expect(payment.amount).toStrictEqual(amount);
    }
    expect(paymentSum.lte(cycleReport.feeIncome));
  });
});
