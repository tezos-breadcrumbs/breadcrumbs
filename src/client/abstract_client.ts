import { BigNumber } from "bignumber.js";
import { AxiosInstance } from "axios";

export abstract class Client {
  abstract instance: AxiosInstance;
  abstract getCycleData(baker: string, cycle: number): Promise<CycleData>;
  abstract getLastCycle(): Promise<number | void>;
}

export interface CycleData {
  cycleDelegatedBalance: BigNumber;
  cycleStakingBalance: BigNumber;
  cycleRewards: BigNumber;
  cycleShares: { address: string; balance: BigNumber }[];
}
