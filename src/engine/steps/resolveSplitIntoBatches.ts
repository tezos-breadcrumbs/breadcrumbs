import BigNumber from "bignumber.js";
import { isEmpty } from "lodash";

import { BasePayment, StepArguments } from "src/engine/interfaces";
import { paymentAmountAboveZeroFactory } from "src/engine/validate";
import { add } from "src/utils/math";

const collectBatches = (
  batches: Array<BasePayment[]>,
  payments: BasePayment[],
  limits: {
    hard_storage_limit_per_operation: BigNumber;
    hard_gas_limit_per_operation: BigNumber;
  }
) => {
  let currentBatch: {
    payments: BasePayment[];
    storageTotal: BigNumber;
    gasTotal: BigNumber;
  } = {
    payments: [],
    storageTotal: new BigNumber(0),
    gasTotal: new BigNumber(0),
  };

  for (const payment of payments) {
    if (
      currentBatch.storageTotal
        .plus(payment.storageLimit ?? 0)
        .gte(limits.hard_storage_limit_per_operation) ||
      currentBatch.gasTotal
        .plus(payment.gasLimit ?? 0)
        .gte(limits.hard_gas_limit_per_operation)
      /*, max_operation_data_length*/
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
};

export const resolveSplitIntoBatches = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { cycleReport, tezos } = args;

  if (!tezos)
    throw new Error(
      `${resolveSplitIntoBatches.name} requires valid tezos toolkit (current value: ${tezos})!`
    );

  const limits = await tezos.rpc.getConstants();

  const batches: typeof cycleReport.batches = [];

  const { delegatorPayments } = cycleReport;

  const filteredDelegatorPayments = delegatorPayments
    .filter((p) => !p.recipient.startsWith(`KT`))
    .filter(paymentAmountAboveZeroFactory);
  collectBatches(batches, filteredDelegatorPayments, limits);

  const filteredDelegatorContractPayments = delegatorPayments
    .filter((p) => p.recipient.startsWith(`KT`))
    .filter(paymentAmountAboveZeroFactory);
  collectBatches(batches, filteredDelegatorContractPayments, limits);

  /* Process fee income and bond reward payments into separate batches */
  const { feeIncomePayments, bondRewardPayments, donationPayments } =
    cycleReport;

  batches.push(feeIncomePayments);
  batches.push(bondRewardPayments);
  batches.push(donationPayments);

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      batches,
    },
  };
};
