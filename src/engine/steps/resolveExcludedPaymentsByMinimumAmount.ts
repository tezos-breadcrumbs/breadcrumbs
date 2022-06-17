import BigNumber from "bignumber.js";

import { ENoteType, EPaymentType, StepArguments } from "src/engine/interfaces";
import { getMinimumPaymentAmount } from "src/engine/helpers";
import { MUTEZ_FACTOR } from "src/utils/constants";

export const resolveExcludedPaymentsByMinimumAmount = (
  args: StepArguments
): StepArguments => {
  const { config, cycleReport } = args;

  let feeIncome = cycleReport.feeIncome;

  /* Convert minimum amount to mutez */
  const minimumPaymentAmount =
    getMinimumPaymentAmount(config).times(MUTEZ_FACTOR);

  const delegatorPayments: typeof cycleReport.delegatorPayments = [];
  for (const payment of cycleReport.delegatorPayments) {
    if (payment.amount.lt(minimumPaymentAmount)) {
      switch (config.accounting) {
        case true:
          delegatorPayments.push({
            ...payment,
            type: EPaymentType.Accounted,
            // restore tx fee to amount if not paid by baker
            amount: payment.amount.plus(
              config.baker_pays_tx_fee ? 0 : payment.txFee ?? 0
            ),
            txFee: new BigNumber(0),
            note: ENoteType.PaymentBelowMinimum,
          });
          break;
        default:
          feeIncome = feeIncome.plus(payment.amount.plus(payment.txFee ?? 0));
          delegatorPayments.push({
            ...payment,
            fee: payment.amount.plus(payment.txFee ?? 0),
            amount: new BigNumber(0),
            txFee: new BigNumber(0),
            note: ENoteType.PaymentBelowMinimum,
          });
          break;
      }
    } else {
      delegatorPayments.push({ ...payment });
    }
  }

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      feeIncome: feeIncome,
      delegatorPayments,
    },
  };
};
