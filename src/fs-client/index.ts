import { parse } from "csv-parse";
import { writeFile, readFile } from "fs/promises";
import { createObjectCsvWriter } from "csv-writer";
import { get, isEmpty, some } from "lodash";
import { stringify } from "hjson";

import { CycleData } from "src/api-client/abstract_client";
import {
  BasePayment,
  CycleReport,
  DelegatorPayment,
} from "src/engine/interfaces";
import { ensureDirectoryExists } from "src/utils/fs";

const DELEGATOR_REPORT_HEADERS = [
  { id: "timestamp", title: "Timestamp" },
  { id: "cycle", title: "Cycle" },
  { id: "type", title: "Payment Type" },
  { id: "delegator", title: "Delegator" },
  { id: "delegatorBalance", title: "Delegated Balance" },
  { id: "feeRate", title: "Fee Rate" },
  { id: "fee", title: "Fee" },
  { id: "amount", title: "Amount" },
  { id: "recipient", title: "Recipient" },
  { id: "hash", title: "Transaction Hash" },
  { id: "note", title: "Note" },
];

export const readPaymentReport = async (
  cycle: number,
  path: string
): Promise<(DelegatorPayment | BasePayment)[]> => {
  return (await readCSV(`${path}/${cycle}.csv`, DELEGATOR_REPORT_HEADERS)) as (
    | DelegatorPayment
    | BasePayment
  )[];
};

export const writePaymentReport = async (
  cycle: number,
  payments: (DelegatorPayment | BasePayment)[],
  path: string
) => {
  const records = payments.map(formatPayment);

  await ensureDirectoryExists(path);
  await writeCSV(`${path}/${cycle}.csv`, DELEGATOR_REPORT_HEADERS, records);
};

export const writeDelegatorReport = async (
  startCycle: number,
  endCycle: number,
  delegator: string,
  payments: (DelegatorPayment | BasePayment)[],
  path: string
) => {
  const records = payments.map((payment) => ({
    ...formatPayment(payment),
    timestamp: payment["timestamp"],
  }));
  await ensureDirectoryExists(path);
  await writeCSV(
    `${path}/${delegator}:${startCycle}_to_${endCycle}.csv`,
    DELEGATOR_REPORT_HEADERS,
    records
  );
};

export const writeCycleReport = async (
  cycleReport: CycleReport,
  cycleData: CycleData,
  path: string
) => {
  await ensureDirectoryExists(path);

  await writeHJSON(
    path,
    cycleReport.cycle,
    prepareCycleReport(cycleReport, cycleData)
  );
};

const prepareCycleReport = (cycleReport: CycleReport, cycleData: CycleData) => {
  return {
    cycle: cycleReport.cycle,
    cycleRewards: cycleData.cycleRewards.toString(),
    cycleStakingBalance: cycleData.cycleStakingBalance.toString(),
    feeIncome: cycleReport.feeIncome.toString(),
    lockedBondRewards: cycleReport.lockedBondRewards.toString(),
  };
};

function formatPayment(payment: DelegatorPayment | BasePayment): {
  [key: string]: string;
} {
  return {
    type: payment.type,
    cycle: payment.cycle.toString(),
    recipient: payment.recipient,
    amount: payment.amount.toString(),
    timestamp: new Date().toISOString(),
    hash: payment.hash,
    /* The below fields are applicable to delegator payments only */
    delegator: get(payment, "delegator", ""),
    delegatorBalance: get(payment, "delegatorBalance", "").toString(),
    fee: get(payment, "fee", "").toString(),
    feeRate: get(payment, "feeRate", "").toString(),
    note: get(payment, "note", "").toString(),
  };
}

const readCSV = async (
  path: string,
  header: { id: string; title: string }[]
) => {
  const data = (await readFile(path)).toString();
  const records: Array<object> = await new Promise((resolve, reject) =>
    parse(
      data,
      { columns: header.map((x) => x.title), skip_empty_lines: true },
      (err, records) => {
        if (err) {
          return reject(err);
        }
        resolve(records);
      }
    )
  );
  // remap keys
  const results: Array<object> = [];
  // strip header
  if (
    isEmpty(
      Object.entries(records[0]).filter(
        (entry) =>
          !some(
            header,
            (column) => column.title === entry[0] && column.title === entry[1]
          )
      )
    )
  ) {
    records.shift();
  }
  for (const record of records) {
    const mappedRecord = {};
    for (const column of header) {
      mappedRecord[column.id] = record[column.title];
    }
    results.push(mappedRecord);
  }
  return results;
};

const writeCSV = async (
  path: string,
  header: { id: string; title: string }[],
  records: { [key: string]: string }[]
) => {
  const CSVWriter = createObjectCsvWriter({
    path,
    header,
  });

  await CSVWriter.writeRecords(records);
};

const writeHJSON = async (
  path: string,
  cycle: number,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  object: { [key: string]: any }
) => {
  const json = stringify(object, { space: "  " });
  try {
    await writeFile(`${path}/${cycle}.hjson`, json);
  } catch (err) {
    console.log(err);
  }
};
