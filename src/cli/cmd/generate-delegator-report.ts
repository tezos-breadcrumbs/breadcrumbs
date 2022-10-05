import fs from "fs";
import { join } from "path";

import { readPaymentReport, writeDelegatorReport } from "src/fs-client";
import { globalCliOptions } from "src/cli/global";

import {
  REPORTS_SUCCESS_PAYMENTS_DIRECTORY,
  CUSTOM_DELEGATOR_REPORT_DIRECTORY,
  REPORTS_FAILED_PAYMENTS_DIRECTORY,
} from "src/utils/constants";

import {
  BasePayment,
  DelegatorPayment,
  EPaymentType,
} from "src/engine/interfaces";
import { sortBy } from "lodash";

export const generateDelegatorReport = async (commandOptions) => {
  await fs.readdir(REPORTS_SUCCESS_PAYMENTS_DIRECTORY, async (err, files) => {
    const { startCycle, endCycle, delegator } = commandOptions;

    const payments: (BasePayment | DelegatorPayment)[] = [];

    const cycleSet = files
      .map((n) => Number(n.replace(".csv", "")))
      .filter((n) => n >= startCycle)
      .filter((n) => n <= endCycle)
      .sort();

    const firstFoundCycle = cycleSet[0];
    const lastFoundCycle = cycleSet[cycleSet.length - 1];

    console.info(` The first found cycle is cycle ${firstFoundCycle}`);
    console.info(` The last found cycle is cycle ${lastFoundCycle}`);
    console.info(" Processing ...\n");

    for (let cycle = firstFoundCycle; cycle <= lastFoundCycle; cycle++) {
      try {
        const report = await readPaymentReport(
          cycle,
          join(globalCliOptions.workDir, REPORTS_SUCCESS_PAYMENTS_DIRECTORY)
        );

        const _payments = report
          .filter((p) => p.type === EPaymentType.Delegator)
          .filter((p) => (p as DelegatorPayment).delegator === delegator);

        payments.push(..._payments);
      } catch (error) {
        /* Log a warning if the report is not found */
        if ((error as Error).message.startsWith("ENOENT")) {
          console.error(
            "\x1b[33m",
            `WARNING: No report found for cycle ${cycle}`,
            "\x1b[0m"
          );
        }
      }

      try {
        const failedPaymentReport = await readPaymentReport(
          cycle,
          join(globalCliOptions.workDir, REPORTS_FAILED_PAYMENTS_DIRECTORY)
        );
        if (failedPaymentReport)
          console.log(
            "\x1b[33m",
            `WARNING: Failed payments found for cycle ${cycle}`,
            "\x1b[0m"
          );
      } catch (_error) {
        continue;
      }
    }

    await writeDelegatorReport(
      startCycle,
      endCycle,
      delegator,
      sortBy(payments, ["timestamp"]),
      CUSTOM_DELEGATOR_REPORT_DIRECTORY
    );

    console.info(`\n The report has been generated.`);

    if (err) {
      console.error("Could not find the reports directory.");
      process.exit(1);
    }
  });
};
