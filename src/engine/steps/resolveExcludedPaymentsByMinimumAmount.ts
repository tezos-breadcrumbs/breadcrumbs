import _ from "lodash";
import { ENoteType, StepArguments } from "src/engine/interfaces";
import { getMinimumPaymentAmount } from "src/engine/helpers";
import BigNumber from "bignumber.js";
import { MUTEZ_FACTOR } from "src/utils/constants";

export const resolveExcludedPaymentsByMinimumAmount = (
  args: StepArguments
): StepArguments => {
  const { config, cycleReport } = args;

  let feeIncome = cycleReport.feeIncome;

  /* Convert minimum amount to mutez */
  const minimumPaymentAmount =
    getMinimumPaymentAmount(config).times(MUTEZ_FACTOR);

  const delegatorPayments = _.map(cycleReport.delegatorPayments, (payment) => {
    if (payment.amount.lt(minimumPaymentAmount)) {
      feeIncome = feeIncome.plus(payment.amount);
      return {
        ...payment,
        fee: payment.amount,
        amount: new BigNumber(0),
        note: ENoteType.PaymentBelowMinimum,
      };
    } else {
      return payment;
    }
  });

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      feeIncome,
      delegatorPayments,
    },
  };
};
