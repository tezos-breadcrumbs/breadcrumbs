import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { get } from "lodash";
import { stringify } from "hjson";

import { CycleData } from "src/api-client/abstract_client";
import {
  BasePayment,
  CycleReport,
  DelegatorPayment,
} from "src/engine/interfaces";

const DELEGATOR_REPORT_HEADERS = [
  { id: "timestamp", title: "Timestamp" },
  { id: "cycle", title: "Cycle" },
  { id: "payment_type", title: "Payment Type" },
  { id: "delegator", title: "Delegator" },
  { id: "delegator_balance", title: "Delegated Balance" },
  { id: "fee_rate", title: "Fee Rate" },
  { id: "fee", title: "Fee" },
  { id: "amount", title: "Amount" },
  { id: "recipient", title: "Recipient" },
  { id: "tx_hash", title: "Transaction Hash" },
  { id: "note", title: "Note" },
];

export const writePaymentReport = async (
  cycle: number,
  payments: (DelegatorPayment | BasePayment)[],
  path: string
) => {
  const records = payments.map(formatPayment);

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  await writeCSV(`${path}/${cycle}.csv`, DELEGATOR_REPORT_HEADERS, records);
};

export const writeCycleReport = async (
  cycleReport: CycleReport,
  cycleData: CycleData,
  path: string
) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

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
    payment_type: payment.type,
    cycle: payment.cycle.toString(),
    recipient: payment.recipient,
    amount: payment.amount.toString(),
    timestamp: new Date().toISOString(),
    tx_hash: payment.hash,
    /* The below fields are applicable to delegator payments only */
    delegator: get(payment, "delegator", ""),
    delegator_balance: get(payment, "delegatorBalance", "").toString(),
    fee: get(payment, "fee", "").toString(),
    fee_rate: get(payment, "feeRate", "").toString(),
    note: get(payment, "note", "").toString(),
  };
}

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
  await fs.writeFile(`${path}/${cycle}.hjson`, json, (err) => {
    if (err) console.log(err);
  });
};
