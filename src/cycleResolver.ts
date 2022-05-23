import client from "./api-client";
import _ from "lodash";

import { Payment } from "../database/models";

const getLastProcessedCycle = async () => {
  const result = await Payment.findAll({
    order: [["cycle", "DESC"]],
    limit: 1,
  });

  return _.isEmpty(result) ? null : result[0].cycle;
};

export const getStartingCycle = async (): Promise<number> => {
  const lastCycle = await client.getLastCycle();
  const lastProcessedCycle = await getLastProcessedCycle();

  return lastProcessedCycle ? lastProcessedCycle : lastCycle;
};
