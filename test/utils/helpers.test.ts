import { BigNumber } from "bignumber.js";
import { Config } from "../../src/config/interface";
import { getApplicableFee, getRedirectAddress } from "../../src/engine/helpers";

const TEST_DELEGATOR = "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU";

const BASE_CONFIG: Config = {
  baking_address: "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur",
  default_fee: "5",
  redirect_payments: {},
  fee_exceptions: {},
  overdelegation_guard: true,
};

describe("getApplicableFee", () => {
  test("returns default fee if no exception is specified", () => {
    const actual = getApplicableFee(BASE_CONFIG, TEST_DELEGATOR);
    const expected = new BigNumber("5");
    expect(actual).toStrictEqual(expected);
  });

  test("returns alternative fee if  exception is specified", () => {
    const config: Config = {
      ...BASE_CONFIG,
      fee_exceptions: { [TEST_DELEGATOR]: "8" },
    };
    const actual = getApplicableFee(config, TEST_DELEGATOR);
    const expected = new BigNumber("8");
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
    const updatedConfig: Config = {
      ...BASE_CONFIG,
      redirect_payments: { [TEST_DELEGATOR]: redirectAddress },
    };
    const actual = getRedirectAddress(updatedConfig, TEST_DELEGATOR);
    const expected = redirectAddress;
    expect(actual).toStrictEqual(expected);
  });
});
