/** @jest-environment setup-polly-jest/jest-environment-node */

import axios from "axios";
import _ from "lodash";
import { getStartingCycle } from "../src/cycleResolver";
import { payments_1 } from "./helpers/data";

import * as Polly from "./helpers/polly";

// describe("test", () => {
// let db: any = require("../database/models");
// const { Payment } = db;
// Polly.start();
// beforeAll(async () => {
//   await db.sequelize.sync({ force: true });
// });
// test("returns network's last concluded cycle if the database is empty", async () => {
//   const actual = await getStartingCycle();
//   const expected = await axios
//     .get("https://api.tzkt.io/v1/head")
//     .then(({ data: { cycle: headCycle } }) => headCycle - 1);
//   expect(actual).toEqual(expected);
// });
// test("returns cycle after the last processed one if database is not empty", async () => {
//   await Payment.bulkCreate(payments_1);
//   const actual = await getStartingCycle();
//   const expected = _.orderBy(payments_1, ["cycle"], ["desc"])[0]["cycle"];
//   expect(actual).toEqual(expected);
// });
// afterAll(async () => {
//   await db.sequelize.close();
// });
// });
