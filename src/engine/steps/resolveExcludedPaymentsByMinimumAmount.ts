import BigNumber from "bignumber.js";

import { ENoteType, StepArguments } from "src/engine/interfaces";
import { getMinimumPaymentAmount } from "src/engine/helpers";
import { add } from "src/utils/math";
import { MUTEZ_FACTOR } from "src/utils/constants";

export const resolveExcludedPaymentsByMinimumAmount = (
  args: StepArguments
): StepArguments => {
  const { config, cycleReport } = args;

  /* Convert minimum amount to mutez */
  const minimumPaymentAmount =
    getMinimumPaymentAmount(config).times(MUTEZ_FACTOR);

  const _delegatorPayments: typeof cycleReport.delegatorPayments = [];
  const _toBeAccountedPayments: typeof cycleReport.delegatorPayments = [];
  let _feeIncome = cycleReport.feeIncome;

  for (const payment of cycleReport.delegatorPayments) {
    if (payment.amount.lt(minimumPaymentAmount)) {
      const _payment = {
        ...payment,
        note: ENoteType.PaymentBelowMinimum,
        fee: payment.amount,
        amount: new BigNumber(0),
        transactionFee: new BigNumber(0),
      };

      _delegatorPayments.push(_payment);

      _toBeAccountedPayments.push({
        ...payment,
        transactionFee: new BigNumber(0),
        note: ENoteType.PaymentBelowMinimum,
      });

      if (!config.accounting_mode) {
        /* Do not increment fee income if payment will be stashed */
        _feeIncome = add(_feeIncome, _payment.fee);
      }
    } else {
      _delegatorPayments.push(payment);
    }
  }

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      feeIncome: _feeIncome,
      delegatorPayments: _delegatorPayments,
      toBeAccountedPayments: _toBeAccountedPayments,
    },
  };
};
