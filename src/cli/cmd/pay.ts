import { initializeCycleReport } from "src/engine/helpers";

import client from "src/api-client";
import engine from "src/engine";
import { getConfig } from "src/config";
import { printPaymentsTable } from "src/cli/print";
import {
  createProvider,
  prepareTransaction,
  submitBatch,
} from "src/tezos-client";
import { arePaymentsRequirementsMet } from "src/engine/validate";
import { cliOptions } from "src/cli";
import { writeDelegatorPayments } from "src/fs-client";
import _ from "lodash";

export const pay = async (cycle: number) => {
  if (cliOptions.dryRun) {
    console.log(`Running in 'dry-run' mode...`);
  }

  const config = getConfig();

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

  const allPayments = [
    ...delegatorPayments,
    ...feeIncomePayments,
    ...bondRewardPayments,
  ];
  const transactions = allPayments
    .filter(arePaymentsRequirementsMet)
    .map(prepareTransaction);

  if (cliOptions.dryRun) {
    printPaymentsTable(allPayments);
    process.exit(0);
  }

  try {
    const provider = createProvider();
    // await submitBatch(provider, transactions);
    await writeDelegatorPayments(cycle, delegatorPayments, "reports/success");
  } catch (e) {
    await writeDelegatorPayments(cycle, delegatorPayments, "reports/failed");
  }
};
