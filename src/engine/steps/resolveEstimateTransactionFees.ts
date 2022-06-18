import { map } from "lodash";
import { ParamsWithKind } from "@taquito/taquito";
import BigNumber from "bignumber.js";

import { prepareTransaction } from "src/tezos-client";
import { EngineOptions, StepArguments } from "src/engine/interfaces";

export const resolveEstimateTransactionFees = async (
  args: StepArguments,
  { tezos }: EngineOptions
): Promise<StepArguments> => {
  if (!tezos)
    throw new Error(
      `${resolveEstimateTransactionFees.name} requires valid tezos toolkit (current value: ${tezos})!`
    );

  const { cycleReport } = args;

  const estimates = await tezos.estimate.batch(
    map(cycleReport.delegatorPayments, prepareTransaction) as ParamsWithKind[]
  );

  if (estimates.length - 1 === cycleReport.delegatorPayments.length) {
    /* Exclude reveal operation at the beginning. This only happens on testnet */
    estimates.splice(0, 1);
  }

  const delegatorPayments: typeof cycleReport.delegatorPayments = [];
  for (const index in cycleReport.delegatorPayments) {
    const estimate = estimates[index];

    delegatorPayments.push({
      ...cycleReport.delegatorPayments[index],
      txFee: new BigNumber(estimate.totalCost),
      storageLimit: new BigNumber(estimate.storageLimit),
      gasLimit: new BigNumber(estimate.gasLimit),
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
