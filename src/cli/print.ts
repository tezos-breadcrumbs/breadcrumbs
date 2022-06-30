import BigNumber from "bignumber.js";
import { Table } from "console-table-printer";

import { divide, multiply } from "src/utils/math";
import { getConfig } from "src/config";

import {
  BasePayment,
  DelegatorPayment,
  ENoteType,
} from "src/engine/interfaces";
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
    getConfig().payment_requirements?.baker_pays_transaction_fee
      ? "the baker"
      : "delegators"
  }`;

  for (const payment of payments) {
    const paymentInfo: PrintableDelegatorPayment = {
      recipient: shortenAddress(payment.recipient),
      delegator: shortenAddress(payment.delegator),
      feeRate: `${multiply(payment.feeRate, 100).toString()}%`,
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

  const accountingMode = getConfig("accounting_mode");
  const accountingNote = `Excluded payments ${
    accountingMode ? "will" : "will not"
  } be paid at a later stage`;

  const exclusionNote = (paymentNote: ENoteType | string) => {
    const getThreshold = () => {
      switch (paymentNote) {
        case ENoteType.BalanceBelowMinimum: {
          return getConfig().delegator_requirements?.minimum_balance;
        }
        case ENoteType.PaymentBelowMinimum: {
          return getConfig().payment_requirements?.minimum_amount;
        }
        default: {
          return "";
        }
      }
    };

    return `${paymentNote} ${getThreshold()} TEZ`;
  };

  for (const payment of payments) {
    const paymentInfo: PrintableExcludedPayment = {
      recipient: shortenAddress(payment.recipient),
      delegator: shortenAddress(payment.delegator),
      amount: `${normalizeAmount(
        accountingMode ? payment.amount : payment.fee
      )} TEZ`,
      delegatorBalance: `${normalizeAmount(payment.delegatorBalance)} TEZ`,
      note: `${exclusionNote(payment.note ?? "")}`,
    };

    table.addRow(paymentInfo);
  }
  table.printTable();
  console.log(accountingNote);
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
  return divide(input ?? 0, MUTEZ_FACTOR).dp(3);
};
