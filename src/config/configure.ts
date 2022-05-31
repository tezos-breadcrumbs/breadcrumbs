const inquirer = require("inquirer");
const fs = require("fs");

const {
  filterRedirects,
  filterOverDelegationBlacklist,
  filterNumber,
  filterDistributionShares,
} = require("./filters");

const {
  validAddress,
  validPercentage,
  validRedirect,
  validFeeExceptions,
  validAddressList,
  validNumber,
  validDistributionShares,
} = require("./validators.ts");

console.log("Welcome to breadcrumbs.");

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
    type: "input",
    name: "redirect_payments",
    message: "Specify rules to redirect payments:",
    validate: validRedirect,
    filter: filterRedirects,
  },
  {
    type: "input",
    name: "fee_exceptions",
    message: "Specify delegators subject to alternative fees:",
    validate: validFeeExceptions,
    filter: filterRedirects,
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
    name: "overdelegation_blacklist",
    message:
      "Please list public keys whose reward share will be redistributed to the delegator pool",
    filter: filterOverDelegationBlacklist,
    validate: validAddressList,
  },
  {
    type: "input",
    name: "minimum_payment_amount",
    message:
      "The minimum amount in XTZ payable to a delegator in a given cycle",
    validate: validNumber,
    filter: filterNumber,
    default: "1",
  },

  {
    type: "input",
    name: "fee_income_recipients",
    message: "The address that receives fee income",
    validate: validDistributionShares,
    filter: filterDistributionShares,
  },

  {
    type: "input",
    name: "bond_rewards_recipients",
    message:
      "The address that received baking rewards attributable to the baker's bond",
    validate: validDistributionShares,
    filter: filterDistributionShares,
  },
];

inquirer.prompt(questions).then((answers) => {
  const json = JSON.stringify(answers, null, "  ");
  fs.writeFile("./config.json", json, (err) => {
    if (!err) {
      console.log("Successfully created configuration file.");
    }
  });
});
