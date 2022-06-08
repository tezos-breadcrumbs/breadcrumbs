const fs = require("fs");
import { createObjectCsvWriter } from "csv-writer";
import { DelegatorPayment } from "src/engine/interfaces";

const DELEGATOR_REPORT_HEADERS = [
  { id: "cycle", title: "Cycle" },
  { id: "recipient", title: "Recipient" },
  { id: "amount", title: "Amount" },
];

export const writeDelegatorPayments = async (
  cycle: number,
  payments: DelegatorPayment[],
  path: string
) => {
  const records = payments.map(prepareDelegatorReport);

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  console.log;

  await writeFile(`${path}/${cycle}.csv`, DELEGATOR_REPORT_HEADERS, records);
};

export const prepareDelegatorReport = (payment: DelegatorPayment) => {
  return {
    cycle: payment.cycle.toString(),
    recipient: payment.recipient,
    amount: payment.amount.toString(),
  };
};

const writeFile = async (
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
