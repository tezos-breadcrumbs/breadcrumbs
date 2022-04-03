/** @jest-environment setup-polly-jest/jest-environment-node */

const database = require("../database/models");
describe("test", () => {
  // Set the db object to a variable which can be accessed throughout the whole test file
  let db: any = database;

  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  test("hi ... ", async () => {
    await db.Payment.create({
      cycle: "1",
      delegatorAddress: "2",
      paymentAddress: "3",
      delegatorBalance: "4",
      bakerBalance: "5",
      feeRate: "6",
      paymentAmount: "7",
      paymentHash: "8",
    });

    const payments = await db.Payment.findAll();
    console.log(payments);
  });
  afterAll(async () => {
    await db.sequelize.close();
  });
});
