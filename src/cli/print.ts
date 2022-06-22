import BigNumber from "bignumber.js";
import { Table } from "console-table-printer";

import { divide } from "src/utils/math";
import { getConfig } from "src/config";

import { BasePayment, DelegatorPayment } from "src/engine/interfaces";
import {
  PrintableBakerPayment,
  PrintableDelegatorPayment,
  PrintableExcludedPayment,
} from "./interfaces";

import { MUTEZ_FACTOR } from "src/utils/constants";

export const printDelegatorPaymentsTable = (payments: DelegatorPayment[]) => {
  const table = new Table();
  const columns = [
    "delegator",
    "recipient",
    "delegatorBalance",
    "feeRate",
    "amount",
    "transactionFee",
  ];

  table.addColumns(columns);

  const feeNote = `* Transaction fees paid by ${
    getConfig("baker_pays_tx_fee") ? "the baker" : "delegators"
  }`;

  for (const payment of payments) {
    const paymentInfo: PrintableDelegatorPayment = {
      recipient: shortenAddress(payment.recipient),
      delegator: shortenAddress(payment.delegator),
      amount: `${normalizeAmount(payment.amount)} TEZ`,
      delegatorBalance: `${normalizeAmount(payment.delegatorBalance)} TEZ`,
      transactionFee: `${normalizeAmount(payment.transactionFee)} TEZ`,
    };

    table.addRow(paymentInfo);
  }
  table.printTable();
  console.log(feeNote);
};

export const printExcludedPaymentsTable = (payments: DelegatorPayment[]) => {
  const table = new Table();
  const columns = [
    "delegator",
    "recipient",
    "delegatorBalance",
    "feeRate",
    "amount",
    "note",
  ];

  table.addColumns(columns);

  for (const payment of payments) {
    const paymentInfo: PrintableExcludedPayment = {
      recipient: shortenAddress(payment.recipient),
      delegator: shortenAddress(payment.delegator),
      amount: `${normalizeAmount(payment.amount)} TEZ`,
      delegatorBalance: `${normalizeAmount(payment.delegatorBalance)} TEZ`,
      note: `${payment.note ?? ""} ${getConfig("minimum_payment_amount")} TEZ`,
    };

    table.addRow(paymentInfo);
  }
  table.printTable();
};

export const printBakerPaymentsTable = (payments: BasePayment[]) => {
  const table = new Table();
  const columns = ["type", "recipient", "amount"];

  table.addColumns(columns);

  for (const payment of payments) {
    const paymentInfo: PrintableBakerPayment = {
      type: payment.type,
      recipient: payment.recipient,
      amount: `${normalizeAmount(payment.amount)} TEZ`,
    };

    table.addRow(paymentInfo);
  }
  table.printTable();
};

const shortenAddress = (address: string) => {
  return `${address.substring(0, 4)}...${address.substring(
    address.length - 4
  )}`;
};

const normalizeAmount = (input: BigNumber | undefined) => {
  return divide(input ?? 0, MUTEZ_FACTOR).dp(2);
};
