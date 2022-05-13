import { BigNumber } from "bignumber.js";
import { CycleData } from "src/client/abstract_client";
import { Config } from "src/config";

export interface Payment {
  cycle: number;
  delegator: string;
  paymentAddress: string;
  delegatorBalance: BigNumber;
  bakerStakingBalance: BigNumber;
  bakerCycleRewards: BigNumber;
  feeRate: BigNumber;
  paymentAmount: BigNumber;
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
