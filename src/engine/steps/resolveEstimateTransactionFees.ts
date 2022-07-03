import { get, last, map } from "lodash";
import { ParamsWithKind } from "@taquito/taquito";
import BigNumber from "bignumber.js";

import { prepareTransaction } from "src/tezos-client";
import { ENoteType, StepArguments } from "src/engine/interfaces";
import { add } from "src/utils/math";

export const resolveEstimateTransactionFees = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { cycleReport, tezos } = args;

  if (!tezos)
    throw new Error(
      `${resolveEstimateTransactionFees.name} requires valid tezos toolkit (current value: ${tezos})!`
    );

  const { delegatorPayments, excludedPayments, feeIncome } = cycleReport;

  let _feeIncome = feeIncome;
  const _excludedPayments = [...excludedPayments];

  const walletPayments = delegatorPayments.filter(
    (payment) => !payment.recipient.startsWith(`KT`)
  );
  const ktPayments = delegatorPayments.filter(
    (payment) => !walletPayments.includes(payment)
  );

  const walletEstimates = await tezos.estimate.batch(
    map(walletPayments, prepareTransaction) as ParamsWithKind[]
  );
  if (walletEstimates.length - 1 === walletPayments.length) {
    /* Exclude reveal operation at the beginning. This only happens on testnet */
    walletEstimates.splice(0, 1);
  }

  walletPayments.forEach((payment, index) => {
    const estimate = walletEstimates[index];
    Object.assign(payment, {
      transactionFee: new BigNumber(estimate.totalCost),
      storageLimit: new BigNumber(estimate.storageLimit),
      gasLimit: new BigNumber(estimate.gasLimit),
    });
  });

  for (const payment of ktPayments) {
    try {
      /* last to skip reveal operation at the beginning. This only happens on testnet */
      const estimate = last(
        await tezos.estimate.batch([
          prepareTransaction(payment),
        ] as ParamsWithKind[])
      );
      if (!estimate)
        throw new Error(
          `Contract call without available estimate. This should never happen!`
        );
      Object.assign(payment, {
        transactionFee: new BigNumber(estimate.totalCost),
        storageLimit: new BigNumber(estimate.storageLimit),
        gasLimit: new BigNumber(estimate.gasLimit),
      });
    } catch (err) {
      const id: string = get(err, "id", "").toString();
      if (id.endsWith(`script_rejected`)) {
        // payment rejected
        _feeIncome = add(_feeIncome, payment.amount);
        /* we intentionally mutate so we can filter it later on */
        Object.assign(payment, {
          fee: payment.amount,
          amount: new BigNumber(0),
          transactionFee: new BigNumber(0),
          note: `${ENoteType.ScriptRejected} - ${get(
            err,
            "message",
            "unknown"
          )}`,
        });
        _excludedPayments.push(payment);
        continue;
      }
      throw new Error(
        `Failed to estimate fees for contract transfer - ${get(
          err,
          "message",
          "unknown reason"
        )}!`
      );
    }
  }
  /* Drop rejected payments */
  const _delegatorPayments = delegatorPayments.filter(
    (payment) => !_excludedPayments.includes(payment)
  );

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      delegatorPayments: _delegatorPayments,
      excludedPayments: _excludedPayments,
      feeIncome: _feeIncome,
    },
  };
};
