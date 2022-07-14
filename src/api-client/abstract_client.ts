import { BigNumber } from "bignumber.js";
import { AxiosInstance } from "axios";

export interface Client {
  instance: AxiosInstance;
  getCycleData(baker: string, cycle: number): Promise<CycleData>;
  getLastCompletedCycle(): Promise<number | void>;
}

export interface CycleData {
  cycleDelegatedBalance: BigNumber;
  cycleStakingBalance: BigNumber;
  cycleRewards: BigNumber;
  cycleShares: { address: string; balance: BigNumber }[];
  frozenDepositLimit: BigNumber;
}
