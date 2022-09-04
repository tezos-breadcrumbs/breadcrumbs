import fs from "fs";
import { join } from "path";

import { readPaymentReport, writeDelegatorReport } from "src/fs-client";
import { globalCliOptions } from "src/cli/global";

import {
  REPORTS_SUCCESS_PAYMENTS_DIRECTORY,
  CUSTOM_DELEGATOR_REPORT_DIRECTORY,
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

    let payments: (BasePayment | DelegatorPayment)[] = [];

    const cycleSet = files
      .map((n) => Number(n.replace(".csv", "")))
      .filter((n) => n >= startCycle)
      .filter((n) => n <= endCycle);

    for (const cycle of cycleSet) {
      const report = await readPaymentReport(
        cycle,
        join(globalCliOptions.workDir, REPORTS_SUCCESS_PAYMENTS_DIRECTORY)
      );

      const _payments = report
        .filter((p) => p.type === EPaymentType.Delegator)
        .filter((p) => (p as DelegatorPayment).delegator === delegator);

      payments = [..._payments, ...payments];
    }

    await writeDelegatorReport(
      startCycle,
      endCycle,
      delegator,
      sortBy(payments, ["timestamp"]),
      CUSTOM_DELEGATOR_REPORT_DIRECTORY
    );

    if (err) {
      console.error("Could not find the reports directory.");
      process.exit(1);
    }
  });
};
