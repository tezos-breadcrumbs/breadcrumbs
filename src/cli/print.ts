import BigNumber from "bignumber.js";
import { Table } from "console-table-printer";

import { divide, multiply, sum } from "src/utils/math";
import { getConfig } from "src/config";

import {
  BasePayment,
  DelegatorPayment,
  ENoteType,
} from "src/engine/interfaces";
import {
  PrintableBakerPayment,
  PrintableDelegatorPayment,
  PrintableDistributedPayment,
  PrintableExcludedPayment,
} from "./interfaces";

import { MUTEZ_FACTOR } from "src/utils/constants";
import { map } from "lodash";

export const printDelegatorPaymentsTable = (payments: DelegatorPayment[]) => {
  const table = new Table({
    columns: [
      { name: "delegator", alignment: "left" },
      { name: "recipient" },
      { name: "delegatorBalance" },
      { name: "feeRate" },
      { name: "amount" },
      { name: "transactionFee" },
    ],
  });

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
      transactionFee: `${normalizeAmount(payment.transactionFee, 5)} TEZ`,
    };

    table.addRow(paymentInfo);
  }

  table.addRow({}); /* Add empty table for spacing */

  const total = `${normalizeAmount(
    sum(...map(payments, (payment) => payment.amount))
  )} TEZ`;

  table.addRow({ delegator: "TOTAL", amount: total });

  table.printTable();
  console.log(feeNote);
};

export const printDistributedPaymentsTable = (payments: DelegatorPayment[]) => {
  const table = new Table({
    columns: [
      { name: "delegator", alignment: "left" },
      { name: "recipient" },
      { name: "delegatorBalance" },
      { name: "feeRate" },
      { name: "amount" },
      { name: "hash" },
    ],
  });

  for (const payment of payments) {
    const paymentInfo: PrintableDistributedPayment = {
      recipient: shortenAddress(payment.recipient),
      delegator: shortenAddress(payment.delegator),
      delegatorBalance: `${normalizeAmount(payment.delegatorBalance)} TEZ`,
      feeRate: `${multiply(payment.feeRate, 100).toString()}%`,
      amount: `${normalizeAmount(payment.amount)}`,
      hash: payment.hash,
    };

    table.addRow(paymentInfo);
  }
  table.printTable();
};

export const printExcludedPaymentsTable = (payments: DelegatorPayment[]) => {
  const table = new Table({
    columns: [
      { name: "delegator", alignment: "left" },
      { name: "recipient" },
      { name: "delegatorBalance" },
      { name: "feeRate" },
      { name: "amount" },
      { name: "note" },
    ],
  });

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
      feeRate: `${multiply(payment.feeRate, 100).toString()}%`,
      delegatorBalance: `${normalizeAmount(payment.delegatorBalance)} TEZ`,
      note: `${exclusionNote(payment.note ?? "")}`,
    };

    table.addRow(paymentInfo);
  }
  table.printTable();
  console.log(accountingNote);
};

export const printBakerPaymentsTable = (payments: BasePayment[]) => {
  const table = new Table({
    columns: [
      { name: "type", alignment: "left" },
      { name: "recipient" },
      { name: "amount" },
    ],
  });

  for (const payment of payments) {
    const paymentInfo: PrintableBakerPayment = {
      type: payment.type,
      recipient: payment.recipient,
      amount: `${normalizeAmount(payment.amount)} TEZ`,
    };

    table.addRow(paymentInfo);
  }

  table.addRow({}); /* Add empty table for spacing */

  const total = `${normalizeAmount(
    sum(...map(payments, (payment) => payment.amount))
  )} TEZ`;

  table.addRow({ type: "TOTAL", amount: total });

  table.printTable();
};

const shortenAddress = (address: string) => {
  return `${address.substring(0, 4)}...${address.substring(
    address.length - 4
  )}`;
};

const normalizeAmount = (input: BigNumber | undefined, decimalPlaces = 3) => {
  return divide(input ?? 0, MUTEZ_FACTOR).dp(decimalPlaces);
};
