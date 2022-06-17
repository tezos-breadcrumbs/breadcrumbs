import { TezosToolkit } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { CycleData } from "src/api-client/abstract_client";
import { BreadcrumbsConfiguration } from "src/config/interfaces";

export interface CycleReport {
  cycle: number;
  delegatorPayments: DelegatorPayment[];
  feeIncomePayments: BasePayment[];
  bondRewardPayments: BasePayment[];
  toBeAccountedPayments: BasePayment[];
  feeIncome: BigNumber;
  lockedBondRewards: BigNumber;
  batches: Array<BasePayment[]>;
}

export interface StepArguments {
  config: BreadcrumbsConfiguration;
  cycleData: CycleData;
  cycleReport: CycleReport;
  distributableRewards: BigNumber;
}

export enum EPaymentType {
  Delegator = "Delegator Payment",
  FeeIncome = "Fee Income Payment",
  BondReward = "Bond Reward Payment",
  Accounted = "Accounted",
}

export enum ENoteType {
  BalanceBelowMinimum = "Balance Below Minimum",
  PaymentBelowMinimum = "Payment Amount Below Minimum",
}

export interface BasePayment {
  type: EPaymentType;
  cycle: number;
  recipient: string;
  amount: BigNumber;
  hash: string;
  txFee?: BigNumber;
  storageLimit?: BigNumber | number;
  gasLimit?: BigNumber | number;
}

export interface DelegatorPayment extends BasePayment {
  delegator: string;
  delegatorBalance: BigNumber;
  bakerStakingBalance: BigNumber;
  bakerCycleRewards: BigNumber;
  fee: BigNumber;
  feeRate: BigNumber;
  note?: ENoteType | string;
}

export interface EngineOptions {
  tezos?: TezosToolkit;
}

export type StepFunction = (
  args: StepArguments,
  options: EngineOptions
) => StepArguments | Promise<StepArguments>;
