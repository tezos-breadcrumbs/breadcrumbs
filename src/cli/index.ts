import { Table } from "console-table-printer";
import { BasePayment } from "src/engine/interfaces";
import { pick } from "lodash";
import { MUTEZ_FACTOR } from "src/utils/constants";
import { divide } from "src/utils/math";
import { PrintablePayment } from "./interfaces";

export const print_payments_table = (payments: BasePayment[]) => {
  const table = new Table();
  const columns = [
    "delegator",
    "recipient",
    "delegatorBalance",
    "amount",
    "feeRate",
  ];
  table.addColumns(columns);
  for (const payment of payments) {
    const paymentInfo: Partial<PrintablePayment> = pick(payment, columns);

    paymentInfo.amount = `${divide(paymentInfo.amount ?? 0, MUTEZ_FACTOR)} TEZ`;
    paymentInfo.delegatorBalance = `${divide(
      paymentInfo.delegatorBalance ?? 0,
      MUTEZ_FACTOR
    )} TEZ`;
    table.addRow(paymentInfo);
  }
  table.printTable();
};
