import _ from "lodash";
import { program } from "commander";

import client from "src/api-client";
import engine from "src/engine";

import { initializeCycleReport } from "src/engine/helpers";
import {
  createProvider,
  prepareTransaction,
  submitBatch,
} from "src/tezos-client";

const foo = async () => {
  program
    .requiredOption("-c, --cycle <number>", "specify the cycle to process")
    .parse();

  const opts = program.opts();
  const config = require("./config");

  const cycle = Number(opts.cycle);

  if (_.isNaN(cycle)) {
    throw Error("No cycle number given.");
  }

  const cycleReport = initializeCycleReport(cycle);
  const cycleData = await client.getCycleData(config.baking_address, cycle);

  const result = engine.run({
    config,
    cycleReport,
    cycleData,
    distributableRewards: cycleData.cycleRewards,
  });

  const provider = createProvider();
  const { delegatorPayments, feeIncomePayments, bondRewardPayments } =
    result.cycleReport;

  const transactions = _.concat(
    _.map(
      _.reject(
        delegatorPayments,
        (p) => _.startsWith(p.recipient, "KT") || p.amount.eq(0)
      ),
      prepareTransaction
    ),
    _.map(
      _.reject(
        feeIncomePayments,
        (p) => _.startsWith(p.recipient, "KT") || p.amount.eq(0)
      ),
      prepareTransaction
    ),
    _.map(
      _.reject(
        bondRewardPayments,
        (p) => _.startsWith(p.recipient, "KT") || p.amount.eq(0)
      ),
      prepareTransaction
    )
  );

  await submitBatch(provider, transactions);
};

foo();
