import { BigNumber } from "bignumber.js";
import { CycleReport } from "./interfaces";
import { BreadcrumbsConfiguration } from "src/config/interfaces";

export const getApplicableFee = (
  config: BreadcrumbsConfiguration,
  delegator: string
) => {
  return new BigNumber(
    config.delegator_overrides?.[delegator]?.fee ?? config.default_fee
  ).div(100);
};

export const getRedirectAddress = (
  config: BreadcrumbsConfiguration,
  delegator: string
) => {
  return config.delegator_overrides?.[delegator]?.recipient ?? delegator;
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
    excludedPayments: [],
    creditablePayments: [],
    distributedPayments: [],
    lockedBondRewards: new BigNumber(0),
    feeIncome: new BigNumber(0),
    feesPaid: new BigNumber(0),
    batches: [],
  };
};

export const getMinimumPaymentAmount = (config: BreadcrumbsConfiguration) => {
  return new BigNumber(config.payment_requirements?.minimum_amount ?? 0);
};

export const getMinimumDelegationAmount = (
  config: BreadcrumbsConfiguration
) => {
  return new BigNumber(config.delegator_requirements?.minimum_balance ?? 0);
};
