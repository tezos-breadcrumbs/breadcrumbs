import BigNumber from "bignumber.js";
import { Config } from "src/config/interface";

export const getApplicableFee = (config: Config, delegator: string) => {
  return new BigNumber(config.fee_exceptions[delegator] || config.default_fee);
};

export const getRedirectAddress = (config: Config, delegator: string) => {
  return config.redirect_payments[delegator] || delegator;
};
