const inquirer = require("inquirer");
const fs = require("fs");
const { validAddress, validPercentage } = require("./validators.ts");

console.log("Hi, welcome to Node Pizza");

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
];

inquirer.prompt(questions).then((answers) => {
  console.log("\nOrder receipt:");
  console.log(JSON.stringify(answers, null, "  "));

  const json = JSON.stringify(answers, null, "  ");
  fs.writeFile("./config.json", json, (err) => {
    if (!err) {
      console.log("done");
    }
  });
});
