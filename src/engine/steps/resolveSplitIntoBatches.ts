import BigNumber from "bignumber.js";
import { isEmpty } from "lodash";

import { BasePayment, StepArguments } from "src/engine/interfaces";
import { paymentAmountRequirementsFactory } from "src/engine/validate";
import { add } from "src/utils/math";

export const resolveSplitIntoBatches = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { cycleReport, tezos } = args;

  if (!tezos)
    throw new Error(
      `${resolveSplitIntoBatches.name} requires valid tezos toolkit (current value: ${tezos})!`
    );

  const {
    hard_gas_limit_per_operation,
    hard_storage_limit_per_operation /*, max_operation_data_length*/,
  } = await tezos.rpc.getConstants();

  let currentBatch: {
    payments: BasePayment[];
    storageTotal: BigNumber;
    gasTotal: BigNumber;
  } = {
    payments: [],
    storageTotal: new BigNumber(0),
    gasTotal: new BigNumber(0),
  };

  const batches: typeof cycleReport.batches = [];

  const { delegatorPayments } = cycleReport;

  const filteredDelegatorPayments = delegatorPayments.filter(
    paymentAmountRequirementsFactory
  );

  for (const payment of filteredDelegatorPayments) {
    if (
      currentBatch.storageTotal
        .plus(payment.storageLimit ?? 0)
        .gte(hard_storage_limit_per_operation) ||
      currentBatch.gasTotal
        .plus(payment.gasLimit ?? 0)
        .gte(hard_gas_limit_per_operation)
    ) {
      batches.push(currentBatch.payments);
      currentBatch = {
        payments: [],
        storageTotal: new BigNumber(0),
        gasTotal: new BigNumber(0),
      };
    }
    currentBatch.payments.push(payment);
    currentBatch.storageTotal = add(
      currentBatch.storageTotal,
      payment.storageLimit ?? 0
    );
    currentBatch.gasTotal = add(currentBatch.gasTotal, payment.gasLimit ?? 0);
  }

  /* Add last batch */
  if (!isEmpty(currentBatch.payments)) {
    batches.push(currentBatch.payments);
  }

  /* Process fee income and bond reward payments into separate batches */
  const { feeIncomePayments, bondRewardPayments } = cycleReport;

  batches.push(feeIncomePayments);
  batches.push(bondRewardPayments);

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      batches,
    },
  };
};
