import BigNumber from "bignumber.js";
import { isEmpty } from "lodash";
import { paymentAmountRequirementsFactory } from "../validate";

import { BasePayment, EPaymentType, StepArguments } from "../interfaces";

export const resolveSplitIntoBatches = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { cycleReport, tezos } = args;

  if (!tezos)
    throw new Error(
      `${resolveSplitIntoBatches.name} requires valid tezos toolkit (current value: ${tezos})!`
    );

  cycleReport.batches = [];

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

  const { delegatorPayments, feeIncomePayments, bondRewardPayments } =
    cycleReport;
  const batches: typeof cycleReport.batches = [];

  for (const payment of delegatorPayments
    .filter((p) => p.type !== EPaymentType.Accounted)
    .filter(paymentAmountRequirementsFactory)) {
    if (
      currentBatch.storageTotal
        .plus(payment.storageLimit ?? 0)
        .gte(hard_storage_limit_per_operation) ||
      currentBatch.gasTotal
        .plus(payment.gasLimit ?? 0)
        .gte(hard_gas_limit_per_operation)
    ) {
      cycleReport.batches.push(currentBatch.payments);
      currentBatch = {
        payments: [],
        storageTotal: new BigNumber(0),
        gasTotal: new BigNumber(0),
      };
    }
    currentBatch.payments.push(payment);
    currentBatch.storageTotal = currentBatch.storageTotal.plus(
      payment.storageLimit ?? 0
    );
    currentBatch.gasTotal = currentBatch.gasTotal.plus(payment.gasLimit ?? 0);
  }

  if (!isEmpty(currentBatch.payments)) batches.push(currentBatch.payments); // final batch
  if (!isEmpty(feeIncomePayments))
    batches.push(feeIncomePayments.filter(paymentAmountRequirementsFactory));
  if (!isEmpty(bondRewardPayments))
    batches.push(bondRewardPayments.filter(paymentAmountRequirementsFactory));

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      batches,
      toBeAccountedPayments: delegatorPayments.filter(
        (p) => p.type === EPaymentType.Accounted
      ),
    },
  };
};
