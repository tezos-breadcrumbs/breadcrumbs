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
    const config = generateConfig();
    const result = getApplicableFee(config, TEST_DELEGATOR);

    const expected = new BigNumber(config.default_fee).div(100);
    expect(result).toStrictEqual(expected);
  });

  test("returns alternative fee if  exception is specified", () => {
    const config = generateConfig({
      delegator_overrides: {
        [TEST_DELEGATOR]: {
          fee: 8,
        },
      },
    });
    const result = getApplicableFee(config, TEST_DELEGATOR);
    const expected = new BigNumber(
      config.delegator_overrides?.[TEST_DELEGATOR]?.fee ?? 0
    ).div(100);

    expect(result).toStrictEqual(expected);
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
    const config = generateConfig({
      delegator_overrides: {
        [TEST_DELEGATOR]: {
          recipient: redirectAddress,
        },
      },
    });
    const result = getRedirectAddress(config, TEST_DELEGATOR);
    const expected = redirectAddress;
    expect(result).toStrictEqual(expected);
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
    it("returns the minimum payment amount if it is defined", () => {
      const minimumPaymentAmount = 1;
      const config = generateConfig({
        payment_requirements: {
          minimum_amount: minimumPaymentAmount,
        },
      });
      const result = getMinimumPaymentAmount(config);
      expect(result).toStrictEqual(new BigNumber(minimumPaymentAmount));
    });

    it("returns zero if minimum amount is not defined", () => {
      const config = generateConfig({});
      const result = getMinimumPaymentAmount(config);
      expect(result).toStrictEqual(new BigNumber(0));
    });
  });
});
