/* eslint @typescript-eslint/no-var-requires: "off" */

import { OpKind, TezosToolkit, WalletParamsWithKind } from "@taquito/taquito";
import { getConfig } from "src/config";
import { BasePayment } from "src/engine/interfaces";
import { getSigner } from "./signers";

require("dotenv").config();

export const createProvider = async () => {
  const RPC_URL =
    process.env.RPC_URL ?? getConfig("network_configuration")?.rpc;
  if (RPC_URL === undefined) throw Error("No RPC URL given");
  const tezos = new TezosToolkit(RPC_URL);
  tezos.setProvider({ signer: await getSigner() });
  return tezos;
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

export const submitBatch = async (
  tezos: TezosToolkit,
  payments: WalletParamsWithKind[]
): Promise<string> => {
  console.log("Submitting batch");
  const batch = tezos.wallet.batch(payments);
  const operation = await batch.send();
  await operation.confirmation(2);
  console.log(
    `Transaction confirmed on https://ithacanet.tzkt.io/${operation.opHash}`
  );
  return operation.opHash;
};
