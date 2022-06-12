/* eslint @typescript-eslint/no-var-requires: "off" */
import inquirer from "inquirer";
import fs from "fs";
import { stringify } from "hjson";

const advancedParams = {
  redirect_payments: {},
  fee_exceptions: {},
  overdelegation_blacklist: [],
  minimum_payment_amount: [],
  fee_income_recipients: [],
  bond_reward_recipients: {},
};

const { filterNumber } = require("./filters");

const {
  validAddress,
  validPercentage,
  validNumber,
} = require("./validators.ts");

console.log("Welcome to the breadcrumbs configuration helper.");

const questions = [
  {
    type: "input",
    name: "baking_address",
    message: "Please enter your baking address:",
    validate: validAddress,
  },
  {
    type: "input",
    name: "default_fee",
    message: "Please enter your default service fee:",
    validate: validPercentage,
  },

  {
    type: "list",
    name: "overdelegation_guard",
    message: "Do you want to activate protection against overdelegation?",
    choices: ["YES", "NO"],
    filter: (value) => value === "YES",
  },
  {
    type: "input",
    name: "minimum_delegator_balance",
    message:
      "The minimum delegation amount to receive rewards in the given cycle",
    validate: validNumber,
    filter: filterNumber,
    default: "0",
  },
];

inquirer.prompt(questions).then((answers) => {
  const json = stringify({ ...answers, ...advancedParams }, { space: "  " });
  fs.writeFile("./config.hjson", json, (err) => {
    if (!err) {
      console.log(
        "Successfully created configuration file `config.hjson`. Please edit directly for more advanced configuration"
      );
    }
  });
});
