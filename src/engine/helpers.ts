import { BigNumber } from "bignumber.js";
import { CycleReport } from "./interfaces";
import { get } from "lodash";
import { BreadcrumbsConfiguration } from "src/config/interfaces";

export const getApplicableFee = (
  config: BreadcrumbsConfiguration,
  delegator: string
) => {
  return new BigNumber(
    get(config.fee_exceptions, delegator, config.default_fee)
  ).div(100);
};

export const getRedirectAddress = (
  config: BreadcrumbsConfiguration,
  delegator: string
) => {
  return get(config.redirect_payments, delegator, delegator);
};

export const isOverDelegated = (
  bakerBalance: BigNumber,
  totalStake: BigNumber,
  frozenDepositLimit: BigNumber | null
): boolean => {
  const base = frozenDepositLimit
    ? frozenDepositLimit.lt(bakerBalance)
      ? frozenDepositLimit
      : bakerBalance
    : bakerBalance;

  const TEN_PERCENT = new BigNumber(0.1);
  return base.div(totalStake).lt(TEN_PERCENT);
};

export const initializeCycleReport = (cycle): CycleReport => {
  return {
    cycle,
    delegatorPayments: [],
    feeIncomePayments: [],
    bondRewardPayments: [],
    lockedBondRewards: new BigNumber(0),
    feeIncome: new BigNumber(0),
    batches: [],
    toBeAccountedPayments: [],
  };
};

export const getMinimumPaymentAmount = (config: BreadcrumbsConfiguration) => {
  return new BigNumber(config.minimum_payment_amount ?? 0);
};

export const getMinimumDelegationAmount = (
  config: BreadcrumbsConfiguration
) => {
  return new BigNumber(config.minimum_delegator_balance ?? 0);
};
