import _ from "lodash";
import { DelegatorPayment, StepArguments } from "src/engine/interfaces";
import { getMinimumPaymentAmount } from "src/engine/helpers";
import BigNumber from "bignumber.js";

export const resolveExcludedPaymentsByMinimumAmount = (
  args: StepArguments
): StepArguments => {
  const { config, cycleReport } = args;

  let feeIncome = cycleReport.feeIncome;

  /* Convert minimum amount to mutez */
  const minimumPaymentAmount = getMinimumPaymentAmount(config).times(1000000);

  const delegatorPayments = _.map(cycleReport.delegatorPayments, (payment) => {
    if (payment.amount.lt(minimumPaymentAmount)) {
      feeIncome = feeIncome.plus(payment.amount);
      return { ...payment, amount: new BigNumber(0) };
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
