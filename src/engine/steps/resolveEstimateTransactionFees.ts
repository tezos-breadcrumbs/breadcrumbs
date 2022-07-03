import { get, head, map } from "lodash";
import { Estimate, ParamsWithKind } from "@taquito/taquito";
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
  const _delegatorPayments: typeof delegatorPayments = [];
  const _excludedPayments = [...excludedPayments];

  const walletPayments = delegatorPayments.filter(
    (payment) => !payment.recipient.startsWith(`KT`)
  );
  let ktPayments = delegatorPayments.filter(
    (payment) => !walletPayments.includes(payment)
  );

  const walletEstimates = await tezos.estimate.batch(
    map(walletPayments, prepareTransaction) as ParamsWithKind[]
  );
  if (walletEstimates.length - 1 === walletPayments.length) {
    /* Exclude reveal operation at the beginning. This only happens on testnet */
    walletEstimates.splice(0, 1);
  }

  for (const index in walletEstimates) {
    const estimate = walletEstimates[index];
    const payment = walletPayments[index];

    _delegatorPayments.push({
      ...payment,
      transactionFee: new BigNumber(estimate.totalCost),
      storageLimit: new BigNumber(estimate.storageLimit),
      gasLimit: new BigNumber(estimate.gasLimit),
    });
  }

  const ktEstimates: Array<Estimate> = [];
  for (const payment of ktPayments) {
    try {
      const estimate = head(
        await tezos.estimate.batch([
          prepareTransaction(payment),
        ] as ParamsWithKind[])
      );
      if (!estimate)
        throw new Error(
          `Contract call without available estimate. This should never happen!`
        );
      ktEstimates.push(estimate);
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
        console.log(payment);
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
  ktPayments = ktPayments.filter(
    (payment) => !_excludedPayments.includes(payment)
  );

  if (ktEstimates.length - 1 === ktPayments.length) {
    /* Exclude reveal operation at the beginning. This only happens on testnet */
    ktEstimates.splice(0, 1);
  }
  for (const index in ktEstimates) {
    const estimate = ktEstimates[index];
    const payment = ktPayments[index];

    _delegatorPayments.push({
      ...payment,
      transactionFee: new BigNumber(estimate.totalCost),
      storageLimit: new BigNumber(estimate.storageLimit),
      gasLimit: new BigNumber(estimate.gasLimit),
    });
  }

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
