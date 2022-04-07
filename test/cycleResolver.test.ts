/** @jest-environment setup-polly-jest/jest-environment-node */

import axios from "axios";
import { getStartingCycle } from "../src/cycleResolver";
import * as Polly from "./helpers/polly";

describe("test", () => {
  let db: any = require("../database/models");
  Polly.start();

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  test("returns last concluded cycle if the database is empty", async () => {
    const actual = await getStartingCycle();
    const expected = await axios
      .get("https://api.tzkt.io/v1/head")
      .then(({ data: { cycle: headCycle } }) => headCycle - 1);

    expect(actual).toEqual(expected);
  });

  afterAll(async () => {
    await db.sequelize.close();
  });
});
