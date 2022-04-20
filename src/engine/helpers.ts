import BigNumber from "bignumber.js";
import { Config } from "src/config/interface";

export const getApplicableFee = (config: Config, delegator: string) => {
  return new BigNumber(config.fee_exceptions[delegator] || config.default_fee);
};

export const getRedirectAddress = (config: Config, delegator: string) => {
  return config.redirect_payments[delegator] || delegator;
};

export const isOverDelegated = (
  bakerBalance: BigNumber,
  totalStake: BigNumber
): boolean => {
  const TEN_PERCENT = new BigNumber(0.1);
  return bakerBalance.div(totalStake).gte(TEN_PERCENT);
};
