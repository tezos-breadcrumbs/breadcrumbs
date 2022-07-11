import { TezosToolkit } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { CycleData } from "src/api-client/abstract_client";
import { BreadcrumbsConfiguration } from "src/config/interfaces";

/**
 * @interface CycleReport
 * @member excludedPayments is for payments excluded by minimum amount or delegator balance that WILL NOT be credited later.
 * @member creditablePayments is for payments excluded by minimum amount or delegator balance that WILL be credited later.
 */

interface Flags {
  insufficientBalance?: boolean;
}

export interface CycleReport {
  cycle: number;
  delegatorPayments: DelegatorPayment[];
  excludedPayments: DelegatorPayment[];
  creditablePayments: DelegatorPayment[];
  feeIncomePayments: BasePayment[];
  bondRewardPayments: BasePayment[];
  distributedPayments: DelegatorPayment[] | BasePayment[];
  feeIncome: BigNumber;
  feesPaid: BigNumber;
  lockedBondRewards: BigNumber;
  batches: Array<BasePayment[]>;
}

export interface StepArguments {
  config: BreadcrumbsConfiguration;
  cycleData: CycleData;
  cycleReport: CycleReport;
  distributableRewards: BigNumber;
  tezos: TezosToolkit;
  flags?: Flags;
}

export enum EPaymentType {
  Delegator = "Delegator Payment",
  FeeIncome = "Fee Income Payment",
  BondReward = "Bond Reward Payment",
}

export enum ENoteType {
  BalanceBelowMinimum = "Balance Below Minimum",
  PaymentBelowMinimum = "Payment Amount Below Minimum",
  ScriptRejected = "Script Rejected",
}

export enum EFeePayer {
  Delegator = "D",
  Baker = "B",
}

export interface BasePayment {
  type: EPaymentType;
  cycle: number;
  recipient: string;
  amount: BigNumber;
  hash: string;
  transactionFee?: BigNumber;
  storageLimit?: BigNumber;
  gasLimit?: BigNumber;
}

export interface DelegatorPayment extends BasePayment {
  delegator: string;
  delegatorBalance: BigNumber;
  bakerStakingBalance: BigNumber;
  bakerCycleRewards: BigNumber;
  fee: BigNumber;
  feeRate: BigNumber;
  note?: ENoteType | string;
  transactionFeePaidBy?: EFeePayer;
}

export type StepFunction = (
  args: StepArguments
) => StepArguments | Promise<StepArguments>;
