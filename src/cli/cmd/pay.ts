import { initializeCycleReport } from "src/engine/helpers";

import { join } from "path";
import client from "src/api-client";
import engine from "src/engine";
import { getConfig } from "src/config";
import { printPaymentsTable } from "src/cli/print";
import {
  createProvider,
  prepareTransaction,
  sendBatch,
} from "src/tezos-client";
import { globalCliOptions } from "src/cli";
import { writeCycleReport, writePaymentReport } from "src/fs-client";
import inquirer from "inquirer";
import { BasePayment, DelegatorPayment } from "src/engine/interfaces";
import {
  REPORTS_FAILED_PAYMENTS_DIRECTORY,
  REPORTS_SUCCESS_PAYMENTS_DIRECTORY,
} from "src/utils/constants";

export const pay = async (commandOptions) => {
  if (globalCliOptions.dryRun) {
    console.log(`Running in 'dry-run' mode...`);
  }

  const config = getConfig();
  const cycle = commandOptions.cycle;
  const cycleReport = initializeCycleReport(cycle);
  const cycleData = await client.getCycleData(config.baking_address, cycle);

  const provider = await createProvider(config);
  const result = await engine.run({
    config,
    cycleReport,
    cycleData,
    distributableRewards: cycleData.cycleRewards,
    tezos: provider,
  });

  const { batches: transactionBatches, toBeAccountedPayments } =
    result.cycleReport;

  // TODO: accounting_mode - transactionBatches.toBeAccounted
  const allPayments = transactionBatches.flatMap((x) => x);
  console.log(`Transcations to account:`);
  printPaymentsTable(toBeAccountedPayments);
  console.log(`Transcations to send:`);
  printPaymentsTable(allPayments);
  if (globalCliOptions.dryRun) {
    process.exit(0);
  }
  if (!commandOptions.confirm) {
    const result = await inquirer.prompt({
      type: "confirm",
      name: "confirm",
      message: "Do you really want to send above rewards?",
      default: false,
    });
    if (!result.confirm) {
      console.log(`Aborting...`);
      process.exit(0);
    }
  }

  console.log(`Sending rewards in ${allPayments.length} txs...`);
  const successfulPayments: Array<BasePayment> = [];
  const failedPayments: Array<BasePayment> = [];
  for (const batch of transactionBatches) {
    try {
      console.log(`Sending batch of ${batch.length} txs...`);
      const opBatch = await sendBatch(provider, batch.map(prepareTransaction));
      for (const payment of batch) {
        payment.hash = opBatch.opHash;
      }
      await opBatch.confirmation(2);
      console.log(
        `Transaction confirmed on https://ithacanet.tzkt.io/${opBatch.opHash}`
      );
      successfulPayments.push(...batch);
    } catch (e: unknown) {
      console.error(e);
      for (const payment of batch) {
        (payment as DelegatorPayment).note = (e as Error).message;
      }
      failedPayments.push(...batch);
    }
  }

  if (successfulPayments.length > 0) {
    await writePaymentReport(
      cycle,
      successfulPayments,
      join(globalCliOptions.workDir, REPORTS_SUCCESS_PAYMENTS_DIRECTORY)
    );
  }
  if (failedPayments.length > 0) {
    await writePaymentReport(
      cycle,
      allPayments,
      join(globalCliOptions.workDir, REPORTS_FAILED_PAYMENTS_DIRECTORY)
    );
  }

  await writeCycleReport(
    result.cycleReport,
    cycleData,
    "reports/cycle_summary/"
  );
};
