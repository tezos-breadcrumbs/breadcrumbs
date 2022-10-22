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

  // TODO: fix balance type
  private async getCycleDelegators(
    baker: string,
    cycle: number,
    limit: number,
    offset: number
  ): Promise<Array<{ address: string; balance: any }>> {
    const { data } = await this.instance.get(
      `rewards/split/${baker}/${cycle}?limit=${limit}&offset=${offset}`
    );

    const { delegators } = update(data, "delegators", (list) =>
      map(list, (item) => pick(item, ["address", "balance"]))
    );

    return delegators;
  }

  public async getCycleData(baker: string, cycle: number): Promise<CycleData> {
    try {
      console.info("Fetching cycle data from TzKT ...");
      const {
        data: { frozenDepositLimit },
      } = await this.instance.get(`accounts/${baker}`);

      const { data } = await this.instance.get(
        `rewards/split/${baker}/${cycle}?limit=0`
      );

      const {
        stakingBalance,
        // delegators, // we collect this in loop bellow
        delegatedBalance,
        blockRewards,
        endorsementRewards,
        blockFees,
      } = update(data, "delegators", (list) =>
        map(list, (item) => pick(item, ["address", "balance"]))
      );
      const limit = 1000;
      let fetched: number | undefined = undefined;
      const delegators: Array<{ address: string; balance: any }> = [];

      while (fetched === undefined || fetched === limit) {
        const fetchedDelegators = await this.getCycleDelegators(
          baker,
          cycle,
          limit,
          delegators.length
        );
        fetched = fetchedDelegators.length;
        delegators.push(...fetchedDelegators);
      }

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
      const response = await this.instance.get(
        `/operations/transactions/${opHash}/status`,
        { transformResponse: (res) => res }
      );

      if (response.status === 204) return false;
      const result = JSON.parse(response.data);
      return result === true;
    } catch (err) {
      throw Error("TZKT ERROR: Cannot fetch operation status.");
    }
  };
}
