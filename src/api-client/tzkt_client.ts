/* eslint @typescript-eslint/no-var-requires: "off" */
const JSONBigInt = require("json-bigint")({ alwaysParseAsBig: true });

import axios, { AxiosInstance } from "axios";
import { map, pick, update } from "lodash";
import { sum } from "src/utils/math";
import { Client, CycleData } from "./abstract_client";

export interface Transaction {
  type: string;
  level: number;
  timestamp: string;
  block: string;
  hash: string;
  status: "applied" | string;
}

export class TzKT implements Client {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: "https://api.tzkt.io/v1/",
      transformResponse: [JSONBigInt.parse],
    });
  }

  public async getCycleData(baker: string, cycle: number): Promise<CycleData> {
    try {
      console.info("Fetching cycle data from TzKT ...");
      const { data } = await this.instance.get(
        `rewards/split/${baker}/${cycle}`
      );
      const {
        data: { frozenDepositLimit },
      } = await this.instance.get(`accounts/${baker}`);

      const {
        stakingBalance,
        delegators,
        delegatedBalance,
        blockRewards,
        endorsementRewards,
        blockFees,
      } = update(data, "delegators", (list) =>
        map(list, (item) => pick(item, ["address", "balance"]))
      );

      console.info("Received cycle data from TzKT.");
      return {
        cycleDelegatedBalance: delegatedBalance,
        cycleStakingBalance: stakingBalance,
        cycleShares: delegators,
        cycleRewards: sum(blockRewards, endorsementRewards, blockFees),
        frozenDepositLimit,
      };
    } catch {
      throw Error("TZKT ERROR: Cannot fetch cycle data");
    }
  }

  public getLastCompletedCycle = async (): Promise<number> => {
    try {
      const {
        data: { cycle: headCycle },
      } = await this.instance.get("/head");
      return headCycle - 1;
    } catch (err) {
      throw Error("TZKT ERROR: Cannot fetch last finished cycle.");
    }
  };

  public areOperationTransactionsApplied = async (
    opHash: string
  ): Promise<boolean> => {
    try {
      const { data } = await this.instance.get(
        `/operations/transactions/${opHash}/status`
      );

      return data === true;
    } catch (err) {
      throw Error("TZKT ERROR: Cannot fetch operation status.");
    }
  };
}
