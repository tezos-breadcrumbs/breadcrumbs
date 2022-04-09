import axios, { AxiosInstance } from "axios";
import _ from "lodash";
import { Client } from "./abstract_client";

export class TzKT extends Client {
  instance: AxiosInstance;

  constructor() {
    super();
    this.instance = axios.create({
      baseURL: "https://api.tzkt.io/v1/",
    });
  }

  public getCycleData = (baker: string, cycle: number) => {
    return this.instance
      .get(`rewards/split/${baker}/${cycle}`)
      .then(({ data }) => {
        return _.pick(
          _.update(data, "delegators", (list) =>
            _.map(list, (item) => _.pick(item, ["address", "balance"]))
          ),
          [
            "stakingBalance",
            "delegators",
            "delegatedBalance",
            "blockRewards",
            "endorsementRewards",
          ]
        );
      })
      .then(
        ({
          stakingBalance,
          delegators,
          delegatedBalance,
          blockRewards,
          endorsementRewards,
        }) => {
          return {
            cycleStakingBalance: stakingBalance,
            cycleShares: _.set(
              delegators,
              baker,
              stakingBalance - delegatedBalance
            ),
            cycleRewards: _.sum([blockRewards, endorsementRewards]),
          };
        }
      );
  };

  public getLastCycle = async () => {
    return this.instance
      .get("/head")
      .then(({ data: { cycle: headCycle } }) => headCycle - 1)
      .catch(console.error);
  };
}
