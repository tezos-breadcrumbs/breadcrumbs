/* eslint @typescript-eslint/no-var-requires: "off" */

import { OpKind, TezosToolkit, WalletParamsWithKind } from "@taquito/taquito";
import { BatchWalletOperation } from "@taquito/taquito/dist/types/wallet/batch-operation";
import { BreadcrumbsConfiguration } from "src/config/interfaces";
import { BasePayment, EPaymentType } from "src/engine/interfaces";
import { getSigner } from "src/tezos-client/signers";

export const createProvider = async (config: BreadcrumbsConfiguration) => {
  const RPC_URL = config.network_configuration?.rpc_url;
  if (RPC_URL === undefined) throw Error("No RPC URL given");
  const tezos = new TezosToolkit(RPC_URL);
  tezos.setProvider({ signer: await getSigner(config) });
  return tezos;
};

export const prepareTransactionForEstimation = (
  payment: BasePayment
): WalletParamsWithKind => {
  return {
    kind: OpKind.TRANSACTION,
    to: payment.recipient,
    amount: payment.amount.toNumber(),
    mutez: true,
  };
};

export const prepareTransactionForSubmission = (
  payment: BasePayment
): WalletParamsWithKind => {
  return {
    kind: OpKind.TRANSACTION,
    to: payment.recipient,
    amount: payment.amount.toNumber(),
    mutez: true,
    /* For current simplicity, submit non-delegator payments without the estimates */
    fee:
      payment.type === EPaymentType.Delegator
        ? payment.transactionFee?.toNumber()
        : undefined,

    gasLimit:
      payment.type === EPaymentType.Delegator
        ? payment.gasLimit?.toNumber()
        : undefined,
    storageLimit:
      payment.type === EPaymentType.Delegator
        ? payment.storageLimit?.toNumber()
        : undefined,
  };
};

export const sendBatch = async (
  tezos: TezosToolkit,
  payments: WalletParamsWithKind[]
): Promise<BatchWalletOperation> => {
  const batch = tezos.wallet.batch(payments);
  const operation = await batch.send();
  return operation;
};
