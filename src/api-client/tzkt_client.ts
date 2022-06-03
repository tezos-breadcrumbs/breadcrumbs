const JSONBigInt = require("json-bigint")({ alwaysParseAsBig: true });

import axios, { AxiosInstance } from "axios";
import _ from "lodash";
import { sum } from "../utils/math";
import { Client, CycleData } from "./abstract_client";

export class TzKT extends Client {
  instance: AxiosInstance;

  constructor() {
    super();
    this.instance = axios.create({
      baseURL: "https://api.tzkt.io/v1/",
      transformResponse: [JSONBigInt.parse],
    });
  }

  public async getCycleData(baker: string, cycle: number): Promise<CycleData> {
    console.info("Fetching cycle data from TzKT ...");
    const { data } = await this.instance.get(`rewards/split/${baker}/${cycle}`)
    const { data: { frozenDepositLimit } } = await this.instance.get(`accounts/${baker}`);

    const {
      stakingBalance,
      delegators,
      delegatedBalance,
      blockRewards,
      endorsementRewards,
      blockFees,
    } = _.update(data, "delegators", (list) => _.map(list, (item) => _.pick(item, ["address", "balance"])))

    console.info("Received cycle data from TzKT.");
    return {
      cycleDelegatedBalance: delegatedBalance,
      cycleStakingBalance: stakingBalance,
      cycleShares: delegators,
      cycleRewards: sum(blockRewards, endorsementRewards, blockFees),
      frozenDepositLimit,
    };
  };

  public getLastCycle = async () => {
    try {
      const { data: { cycle: headCycle } } = await this.instance.get("/head")
      return headCycle - 1
    } catch (err) {
      console.error(err)
    }
  };
}
