import BigNumber from "bignumber.js";

interface Payment {
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
