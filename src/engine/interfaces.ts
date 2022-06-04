import { BigNumber } from "bignumber.js";
import { CycleData } from "src/api-client/abstract_client";
import { BreadcrumbsConfiguration } from "src/config";

export interface CycleReport {
  cycle: number;
  delegatorPayments: DelegatorPayment[];
  feeIncomePayments: BasePayment[];
  bondRewardPayments: BasePayment[];
  feeIncome: BigNumber;
  lockedBondRewards: BigNumber;
}

export interface StepArguments {
  config: BreadcrumbsConfiguration;
  cycleData: CycleData;
  cycleReport: CycleReport;
  distributableRewards: BigNumber;
}

export interface BasePayment {
  cycle: number;
  recipient: string;
  amount: BigNumber;
  hash: string;
}

export interface DelegatorPayment extends BasePayment {
  delegator: string;
  delegatorBalance: BigNumber;
  bakerStakingBalance: BigNumber;
  bakerCycleRewards: BigNumber;
  feeRate: BigNumber;
}

export type StepFunction = (args: StepArguments) => StepArguments;
