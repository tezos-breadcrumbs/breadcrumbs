/* eslint @typescript-eslint/no-var-requires: "off" */
import inquirer from "inquirer";
import fs from "fs";
import { stringify } from "hjson";

const {
  filterRpcUrl,
  validBakingAddress,
  validPercentage,
  validPrivateKey,
} = require("./validate/creation");

(async () => {
  const questions = [
    {
      type: "input",
      name: "baking_address",
      message: "Please enter your baking address:",
      validate: validBakingAddress,
    },
    {
      type: "input",
      name: "default_fee",
      message: "Please enter your default service fee:",
      validate: validPercentage,
    },
    {
      type: "list",
      name: "rpc_url",
      message:
        "Please select a Tezos RPC URL. You can customize it later by editing the configuration file",
      choices: [
        "Mainnet|https://mainnet-tezos.giganode.io/",
        "Testnet|https://testnet-tezos.giganode.io/",
      ],
      filter: filterRpcUrl,
    },

    {
      type: "input",
      name: "private_key",
      message:
        "Please enter your private key. It will be persisted locally in `payout_wallet_private.key` file",
      validate: async (input) => validPrivateKey(input),
    },
  ];

  console.log("Welcome to the breadcrumbs configuration helper.");

  inquirer.prompt(questions).then((answers) => {
    const privateKey = answers.private_key;
    const config = {
      baking_address: answers.baking_address,
      default_fee: Number(answers.default_fee),
      network_configuration: {
        rpc_url: answers.rpc_url,
      },
    };

    const json = stringify(config, { space: "  " });
    fs.writeFile("./config.hjson", json, (err) => {
      if (!err) {
        console.log(
          "Successfully created configuration file `config.hjson`. Please edit directly for more advanced configuration"
        );
      }
    });

    fs.writeFile("./payout_wallet_private.key", privateKey, (err) => {
      if (!err) {
        console.log(
          "Successfully created private key file at payout_wallet_private.key"
        );
      }
    });
  });
})();
