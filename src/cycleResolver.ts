import axios from "axios";

export const getLastCycle = async (): Promise<Number | void> => {
  return axios
    .get("https://api.tzkt.io/v1/head")
    .then(({ data: { cycle: headCycle } }) => headCycle - 1)
    .catch(console.error);
};

const getLastPaidCycle = () => {
  /* Fetch latest cycle from Postgres or null*/
};
