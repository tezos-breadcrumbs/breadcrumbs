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

  public getCycleData = (baker: string, cycle: number): Promise<CycleData> => {
    console.info("Fetching cycle data from TzKT ...");
    return this.instance
      .get(`rewards/split/${baker}/${cycle}`)
      .then(async ({ data }) => {
        const {
          data: { frozenDepositLimit },
        } = await this.instance.get(`accounts/${baker}`);

        return _.set(
          _.pick(
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
          ),
          "frozenDepositLimit",
          frozenDepositLimit
        );
      })
      .then(
        ({
          stakingBalance,
          delegators,
          delegatedBalance,
          blockRewards,
          endorsementRewards,
          frozenDepositLimit,
        }) => {
          console.info("Received cycle data from TzKT.");
          return {
            cycleDelegatedBalance: delegatedBalance,
            cycleStakingBalance: stakingBalance,
            cycleShares: _.map(delegators, ({ address, balance }) => ({
              address,
              balance,
            })),
            cycleRewards: sum(blockRewards, endorsementRewards),
            frozenDepositLimit,
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
