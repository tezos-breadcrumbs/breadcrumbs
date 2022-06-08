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
import { writeCycleReport, writeDelegatorReport } from "src/fs-client";

export const pay = async (commandOptions) => {
  if (cliOptions.dryRun) {
    console.log(`Running in 'dry-run' mode...`);
  }

  const config = getConfig();
  const cycle = commandOptions.cycle;
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
    await submitBatch(provider, transactions);
    await writeDelegatorReport(
      cycle,
      delegatorPayments,
      "reports/delegator_payments/success"
    );

    await writeCycleReport(result.cycleReport, "reports/cycle_summary/");
  } catch (e) {
    await writeDelegatorReport(
      cycle,
      delegatorPayments,
      "reports/delegator_payments/failed"
    );
  }
};
