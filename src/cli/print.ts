import { Table } from "console-table-printer";
import { BasePayment } from "src/engine/interfaces";
import { pick } from "lodash";
import { MUTEZ_FACTOR } from "src/utils/constants";
import { divide } from "src/utils/math";
import { PrintablePayment } from "./interfaces";
import { getConfig } from "src/config";

export const printPaymentsTable = (payments: BasePayment[]) => {
  const table = new Table();
  const columns = [
    "delegator",
    "recipient",
    "delegatorBalance",
    "amount",
    "feeRate",
    "transactionFee",
    "type",
  ];
  table.addColumns(columns);

  const baker_pays_tx_fee = getConfig("baker_pays_tx_fee");
  const feeNote = baker_pays_tx_fee ? `(pays baker)` : ``;

  for (const payment of payments) {
    const paymentInfo: Partial<PrintablePayment> = pick(payment, columns);

    paymentInfo.amount = `${divide(paymentInfo.amount ?? 0, MUTEZ_FACTOR)} TEZ`;
    paymentInfo.transactionFee = `${divide(
      paymentInfo.transactionFee ?? 0,
      MUTEZ_FACTOR
    )} TEZ ${feeNote}`;
    paymentInfo.delegatorBalance = `${divide(
      paymentInfo.delegatorBalance ?? 0,
      MUTEZ_FACTOR
    )} TEZ`;
    table.addRow(paymentInfo);
  }
  table.printTable();
};
