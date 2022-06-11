/* eslint @typescript-eslint/no-var-requires: "off" */

import { OpKind, WalletParamsWithKind } from "@taquito/taquito";
import { getConfig } from "src/config";
import { BasePayment } from "src/engine/interfaces";
import { BreadcrumbsTezosProvider } from "./BreacrumbsProvider";

require("dotenv").config();

export const createProvider = (): BreadcrumbsTezosProvider => {
  const { RPC_URL, PKEY } = Object.assign(process.env, {
    RPC_URL: getConfig("network_configuration")?.rpc,
    PKEY: getConfig("payout_wallet_key"),
  });
  if (!RPC_URL) throw Error("No RPC URL given");
  if (!PKEY) throw Error("No private key given");
  return new BreadcrumbsTezosProvider(RPC_URL, PKEY);
};

export const prepareTransaction = (
  payment: BasePayment
): WalletParamsWithKind => {
  return {
    kind: OpKind.TRANSACTION,
    to: payment.recipient,
    amount: payment.amount.toNumber(),
    mutez: true,
  };
};
