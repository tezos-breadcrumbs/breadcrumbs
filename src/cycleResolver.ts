import axios from "axios";
import _ from "lodash";

import { Payment } from "../database/models";

const getLastCycle = async (): Promise<Number | void> => {
  return axios
    .get("https://api.tzkt.io/v1/head")
    .then(({ data: { cycle: headCycle } }) => headCycle - 1)
    .catch(console.error);
};

const getLastProcessedCycle = async () => {
  const result = await Payment.findAll({
    order: [["cycle", "DESC"]],
    limit: 1,
  });

  return _.isEmpty(result) ? null : result[0].cycle;
};

export const getStartingCycle = async (): Promise<Number> => {
  const lastCycle = await getLastCycle();
  const lastProcessedCycle = await getLastProcessedCycle();

  return lastProcessedCycle ? lastProcessedCycle : lastCycle;
};
