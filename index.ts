import { isNaN } from "lodash";
import { program } from "commander";
import { readFileSync } from "fs";
import { parse } from "hjson";

import client from "src/api-client";
import engine from "src/engine";

import { initializeCycleReport } from "src/engine/helpers";
import { BasePayment } from "src/engine/interfaces";
import {
  createProvider,
  prepareTransaction,
  submitBatch,
} from "src/tezos-client";
import { print_payments_table } from "src/cli";

const config = parse(readFileSync(process.env.BC_CONFIG ?? "./config.hjson").toString());

const paymentRequirements = [
  (p: BasePayment) => p.recipient !== config.baking_address,  // in case rewards are redirected to baker himself
  (p: BasePayment) => !p.recipient.startsWith("KT"),           // TODO: we need to allow payments to smart contracts
  (p: BasePayment) => p.amount.gt(0)                          // TODO: Add check for transaction fee
]

const arePaymentsRequirementsMet = (p: BasePayment) =>{
  for (const requirement of paymentRequirements) {
    if (!requirement(p)) return false
  }
  return true
}

const foo = async () => {
  program
    .requiredOption("-c, --cycle <number>", "specify the cycle to process")
    .option("-d, --dry-run", "Prints out rewards. Won't sumbit transactions.")
    .parse();

  const opts = program.opts();

  const config = parse(readFileSync("./config.hjson").toString());
  const cycle = Number(opts.cycle);

  if (isNaN(cycle)) {
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

  const { delegatorPayments, feeIncomePayments, bondRewardPayments } =
  result.cycleReport;
  
  const allPayments = [ ...delegatorPayments, ...feeIncomePayments, ...bondRewardPayments ];
  const transactions = allPayments.filter(arePaymentsRequirementsMet).map(prepareTransaction)
  
  if (opts.dryRun) {
    print_payments_table(allPayments)
    process.exit(0)
  }
  
  const provider = createProvider();
  await submitBatch(provider, transactions);
};

foo();
