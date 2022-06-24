import { initializeCycleReport } from "src/engine/helpers";

import { join } from "path";
import client from "src/api-client";
import engine from "src/engine";
import { getConfig } from "src/config";
import {
  printBakerPaymentsTable,
  printDelegatorPaymentsTable,
  printExcludedPaymentsTable,
} from "src/cli/print";
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
import { flatten } from "lodash";
import { schema } from "src/config/validate/runtime";

export const pay = async (commandOptions) => {
  if (globalCliOptions.dryRun) {
    console.log(`Running in 'dry-run' mode...`);
  }

  const config = getConfig();
  try {
    await schema.validateAsync(config);
  } catch (e) {
    console.log(`Configuration error: ${(e as Error).message}`);
    process.exit(1);
  }

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

  const { batches, creditablePayments, excludedPayments } = result.cycleReport;

  /* The last two batches are related to fee income and bond rewards */
  const delegatorPayments = flatten(batches.slice(0, -2));
  const bakerPayments = flatten(batches.slice(-2));

  console.log("Payments excluded by minimum amount:");
  printExcludedPaymentsTable(
    config.accounting_mode ? creditablePayments : excludedPayments
  );

  console.log(""); /* Line break */

  console.log("Delegator Payments:");
  printDelegatorPaymentsTable(delegatorPayments as DelegatorPayment[]);
  console.log(""); /* Line break */

  console.log("Baker Payments:");
  printBakerPaymentsTable(bakerPayments);
  console.log(""); /* Line break */

  if (config.accounting_mode) {
    /* TO DO: persist creditablePayments  */
  }

  if (globalCliOptions.dryRun) {
    process.exit(0);
  }

  if (!commandOptions.confirm) {
    const result = await inquirer.prompt({
      type: "confirm",
      name: "confirm",
      message: "Do you confirm the above rewards?",
      default: false,
    });
    if (!result.confirm) {
      console.log("Rewards not confirmed. Aborting...");
      process.exit(0);
    }
  }

  const allPayments = flatten(batches);

  const successfulPayments: Array<BasePayment> = [];
  const failedPayments: Array<BasePayment> = [];

  for (let i = 0; i < batches.length; i++) {
    try {
      const batch = batches[i];
      console.log(
        `Sending batch ${i + 1}/${batches.length} containing ${
          batches[i].length
        } transaction(s) ...`
      );
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
      const batch = batches[i];
      for (const payment of batch) {
        (payment as DelegatorPayment).note = (e as Error).message;
      }
      failedPayments.push(...batch);
    }
  }

  if (successfulPayments.length > 0) {
    await writePaymentReport(
      cycle,
      [...successfulPayments, ...excludedPayments],
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
