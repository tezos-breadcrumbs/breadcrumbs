import { BigNumber } from "bignumber.js";
import { BreadcrumbsConfiguration } from "src/config/interfaces";
import {
  getApplicableFee,
  getMinimumPaymentAmount,
  getRedirectAddress,
  isOverDelegated,
} from "src/engine/helpers";
import { generateConfig } from "test/helpers";

const TEST_DELEGATOR = "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU";

const BASE_CONFIG: BreadcrumbsConfiguration = generateConfig();

describe("getApplicableFee", () => {
  test("returns default fee if no exception is specified", () => {
    const actual = getApplicableFee(BASE_CONFIG, TEST_DELEGATOR);
    const expected = new BigNumber("0.05");
    expect(actual).toStrictEqual(expected);
  });

  test("returns alternative fee if  exception is specified", () => {
    const config: BreadcrumbsConfiguration = {
      ...BASE_CONFIG,
      fee_exceptions: { [TEST_DELEGATOR]: "8" },
    };
    const actual = getApplicableFee(config, TEST_DELEGATOR);
    const expected = new BigNumber("0.08");
    expect(actual).toStrictEqual(expected);
  });
});

describe("getRedirectAddress", () => {
  test("returns delegator address if no redirect is specified", () => {
    const actual = getRedirectAddress(BASE_CONFIG, TEST_DELEGATOR);
    const expected = TEST_DELEGATOR;
    expect(actual).toStrictEqual(expected);
  });

  test("returns redirect address if it is specified", () => {
    const redirectAddress = "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur";
    const updatedConfig: BreadcrumbsConfiguration = {
      ...BASE_CONFIG,
      redirect_payments: { [TEST_DELEGATOR]: redirectAddress },
    };
    const actual = getRedirectAddress(updatedConfig, TEST_DELEGATOR);
    const expected = redirectAddress;
    expect(actual).toStrictEqual(expected);
  });
});

describe("isOverDelegated", () => {
  test("returns `true` if the baker's stake is less than 10% of the staking balance", () => {
    const bakerBalance = new BigNumber(6000000000);
    const stakingBalance = bakerBalance.times(10).plus(1);
    expect(isOverDelegated(bakerBalance, stakingBalance, null)).toEqual(true);
  });

  test("returns `true` if the frozen deposit limit is less than 10% of the staking balance", () => {
    const bakerBalance = new BigNumber(10000000000);
    const frozenDepositLimit = new BigNumber(6000000);
    const stakingBalance = frozenDepositLimit.times(10).plus(1);

    const result = isOverDelegated(
      bakerBalance,
      stakingBalance,
      frozenDepositLimit
    );

    expect(result).toEqual(true);
  });

  test("returns `false` if the baker's stake is gte to 10% of the staking balance", () => {
    const bakerBalance = new BigNumber(6000000000);
    const stakingBalance = bakerBalance.times(10);
    expect(isOverDelegated(bakerBalance, stakingBalance, null)).toEqual(false);
  });

  test("returns `false` if the frozen deposit limit is gte to 10% of the staking balance", () => {
    const bakerBalance = new BigNumber(10000000000);
    const frozenDepositLimit = new BigNumber(6000000);
    const stakingBalance = frozenDepositLimit.times(10);

    const result = isOverDelegated(
      bakerBalance,
      stakingBalance,
      frozenDepositLimit
    );

    expect(result).toEqual(false);
  });

  describe("getMinimumPaymentAmount", () => {
    const minimumPaymentAmount = 1;
    const config: BreadcrumbsConfiguration = {
      ...BASE_CONFIG,
      minimum_payment_amount: minimumPaymentAmount,
    };

    const result = getMinimumPaymentAmount(config);
    expect(result).toStrictEqual(new BigNumber(minimumPaymentAmount));
  });
});
