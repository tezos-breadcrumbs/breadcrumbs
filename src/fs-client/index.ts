const fs = require("fs");
import { createObjectCsvWriter } from "csv-writer";
import { DelegatorPayment } from "src/engine/interfaces";

const DELEGATOR_REPORT_HEADERS = [
  { id: "cycle", title: "cycle" },
  { id: "delegator", title: "delegator" },
  { id: "delegator_balance", title: "delegated_balance" },
  { id: "total_baker_balance", title: "total_baker_balance" },
  { id: "total_cycle_rewards", title: "total_cycle_rewards" },
  { id: "fee_rate", title: "fee_rate" },
  { id: "amount", title: "amount" },
  { id: "recipient", title: "recipient" },
  { id: "timestamp", title: "timestamp" },
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

  await writeFile(`${path}/${cycle}.csv`, DELEGATOR_REPORT_HEADERS, records);
};

export const prepareDelegatorReport = (payment: DelegatorPayment) => {
  return {
    cycle: payment.cycle.toString(),
    delegator: payment.delegator,
    delegator_balance: payment.delegatorBalance.toString(),
    total_baker_balance: payment.bakerStakingBalance.toString(),
    total_cycle_rewards: payment.bakerCycleRewards.toString(),
    fee_rate: payment.feeRate.toString(),
    recipient: payment.recipient,
    amount: payment.amount.toString(),
    timestamp: new Date().toUTCString(),
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
