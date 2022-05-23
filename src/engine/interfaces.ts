import { BigNumber } from "bignumber.js";
import { CycleData } from "src/api-client/abstract_client";
import { Config } from "src/config";

export interface Payment {
  cycle: number;
  delegator: string;
  paymentAddress: string;
  delegatorBalance: BigNumber;
  bakerStakingBalance: BigNumber;
  bakerCycleRewards: BigNumber;
  feeRate: BigNumber;
  amount: BigNumber;
  paymentHash: string;
}

export interface CycleReport {
  cycle: number;
  payments: Payment[];
  feeIncome: BigNumber;
  lockedBondRewards: BigNumber;
}

export interface StepArguments {
  config: Config;
  cycleData: CycleData;
  cycleReport: CycleReport;
  distributableRewards: BigNumber;
}

export type StepFunction = (args: StepArguments) => StepArguments;
