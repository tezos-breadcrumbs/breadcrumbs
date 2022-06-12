/* eslint @typescript-eslint/no-var-requires: "off" */

import { OpKind, TezosToolkit, WalletParamsWithKind } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { BasePayment } from "src/engine/interfaces";

require("dotenv").config();

if ("RPC_URL" in process.env === false) {
  console.error("No RPC URL given");
  process.exit(1);
}

if ("PKEY" in process.env === false) {
  console.error("No private key given");
  process.exit(1);
}

const { PKEY, RPC_URL } = process.env;

export const createProvider = (): TezosToolkit => {
  if (!RPC_URL) throw Error("No RPC URL given");
  if (!PKEY) throw Error("No private key given");
  const tezos = new TezosToolkit(RPC_URL);
  tezos.setProvider({ signer: new InMemorySigner(PKEY) });
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
