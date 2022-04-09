import _ from "lodash";
import client from "./client";

const getCycleData = async (baker: string, cycle: number) => {
  const x = await client.getCycleData(baker, cycle);
  console.log(x);
};
getCycleData("tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur", 468);
