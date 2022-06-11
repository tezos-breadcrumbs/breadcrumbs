import { OpKind, ParamsWithKind } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import { map } from "lodash";
import { BasePayment, EngineOptions, StepArguments } from "../interfaces";

const prepareTransaction = (payment: BasePayment) => {
  return {
    kind: OpKind.TRANSACTION,
    to: payment.recipient,
    amount: payment.amount.toNumber(),
    mutez: true,
  } as ParamsWithKind;
};

export const resolveEstimateTxFees = async (
  args: StepArguments,
  { tezos }: EngineOptions
): Promise<StepArguments> => {
  if (!tezos)
    throw new Error(
      `${resolveEstimateTxFees.name} requires valid tezos toolkit (current value: ${tezos})!`
    );

  const { cycleReport } = args;

  const payments = cycleReport.delegatorPayments;

  const estimates = await tezos.estimate.batch(
    map(payments, prepareTransaction)
  );
  if (estimates.length - 1 === payments.length) {
    // reveal op at the beggining
    // bakers should be revealed already, this would happen only during testing
    estimates.splice(0, 1);
  }

  const delegatorPayments: typeof payments = [];
  for (const [index, payment] of payments.entries()) {
    const estimate = estimates[index];
    if (!args.config.baker_pays_tx_fee) {
      payment.amount = payment.amount.minus(estimate.totalCost);
    }

    delegatorPayments.push({
      ...payment,
      txFee: new BigNumber(estimate.totalCost),
      storageLimit: estimate.storageLimit,
      gasLimit: estimate.gasLimit,
    });
  }

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      delegatorPayments,
    },
  };
};
