import { InMemorySigner } from "@taquito/signer";
import {
  OpKind,
  ParamsWithKind,
  TezosToolkit,
  WalletParamsWithKind,
} from "@taquito/taquito";
import { BasePayment } from "src/engine/interfaces";
import BigNumber from "bignumber.js";
import { sumBy } from "lodash";

export interface PreprocessTransactionOptions {
  bakerPayesTxFee: boolean;
  minimumPayoutAmount: number | BigNumber;
}

export class BreadcrumbsTezosProvider {
  private tezos: TezosToolkit;
  constructor(rpcUrl: string, pkey: string) {
    this.tezos = new TezosToolkit(rpcUrl);
    this.tezos.setProvider({ signer: new InMemorySigner(pkey) });
  }

  private prepareTransaction(payment: BasePayment) {
    return {
      kind: OpKind.TRANSACTION,
      to: payment.recipient,
      amount: payment.amount.toNumber(),
      mutez: true,
    } as ParamsWithKind;
  }

  async preprocessTransactionsIntoBatches(
    payments: BasePayment[],
    options: Partial<PreprocessTransactionOptions> = {
      bakerPayesTxFee: false,
      minimumPayoutAmount: 0,
    }
  ): Promise<{
    batches: Array<Array<BasePayment>>;
    totalTxs: number;
    toBeAccounted: BasePayment[];
  }> {
    const test: BasePayment[] = [];
    for (let i = 0; i < 1000; i++) {
      test.push(...payments);
    }
    const {
      hard_gas_limit_per_operation,
      hard_storage_limit_per_operation /*, max_operation_data_length*/,
    } = await this.tezos.rpc.getConstants();
    // TODO: figure out what to do with max_operation_data_length
    const estimates = await this.tezos.estimate.batch(
      payments.map(this.prepareTransaction)
    );
    if (estimates.length - 1 === payments.length) {
      // reveal op at the beggining
      // bakers should be revealed already, this would happen only during testing
      estimates.splice(0, 1);
    }
    if (!options.bakerPayesTxFee) {
      payments = payments.map((payment, index) => {
        payment.amount = payment.amount.minus(estimates[index].totalCost);
        payment.txFee = new BigNumber(estimates[index].totalCost);
        return payment;
      });
    }

    const batches: Array<Array<BasePayment>> = [];
    const toBeAccounted: Array<BasePayment> = [];

    let currentBatch: {
      payments: BasePayment[];
      storageTotal: BigNumber;
      gasTotal: BigNumber;
    } = {
      payments: [],
      storageTotal: new BigNumber(0),
      gasTotal: new BigNumber(0),
    };
    for (let i = 0; i < estimates.length; i++) {
      if (payments[i].amount.lte(options.minimumPayoutAmount ?? 0)) {
        toBeAccounted.push(payments[i]);
        continue;
      }
      const estimate = estimates[i];
      if (
        currentBatch.storageTotal
          .plus(estimate.storageLimit)
          .gte(hard_storage_limit_per_operation) ||
        currentBatch.gasTotal
          .plus(estimate.gasLimit)
          .gte(hard_gas_limit_per_operation)
      ) {
        batches.push(currentBatch.payments);
        currentBatch = {
          payments: [],
          storageTotal: new BigNumber(0),
          gasTotal: new BigNumber(0),
        };
      }
      currentBatch.payments.push(payments[i]);
      currentBatch.storageTotal = currentBatch.storageTotal.plus(
        estimate.storageLimit
      );
      currentBatch.gasTotal = currentBatch.gasTotal.plus(estimate.gasLimit);
    }
    if (currentBatch.payments.length > 0) batches.push(currentBatch.payments); // final batch

    return {
      batches,
      toBeAccounted,
      totalTxs: sumBy(batches, (x) => x.length),
    };
  }

  async submitBatch(payments: WalletParamsWithKind[]) {
    console.log("Submitting batch");
    const batch = this.tezos.wallet.batch(payments);
    const operation = await batch.send();
    const status = await operation.status();
    status;
    await operation.confirmation(2);
    console.log(
      `Transaction confirmed on https://ithacanet.tzkt.io/${operation.opHash}`
    );
    return operation.opHash;
  }
}
