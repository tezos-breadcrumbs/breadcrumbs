import { AxiosInstance } from "axios";

export abstract class Client {
  abstract instance: AxiosInstance;
  abstract getCycleData(baker: string, cycle: number): Promise<CycleData>;
  abstract getLastCycle(): Promise<number | void>;
}

export interface CycleData {
  cycleDelegatedBalance: number;
  cycleStakingBalance: number;
  cycleRewards: number;
  cycleShares: { address: string; balance: number }[];
}
