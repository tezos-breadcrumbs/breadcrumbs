import { map } from "lodash";
import { ENoteType, StepArguments } from "src/engine/interfaces";
import { getMinimumDelegationAmount } from "src/engine/helpers";
import BigNumber from "bignumber.js";
import { MUTEZ_FACTOR } from "src/utils/constants";

export const resolveExcludedPaymentsByMinimumDelegatorBalance = (
  args: StepArguments
): StepArguments => {
  const { config, cycleReport } = args;

  let feeIncome = cycleReport.feeIncome;

  /* Convert minimum amount to mutez */
  const minimumDelegatorBalance =
    getMinimumDelegationAmount(config).times(MUTEZ_FACTOR);

  const delegatorPayments = map(cycleReport.delegatorPayments, (payment) => {
    if (payment.delegatorBalance.lt(minimumDelegatorBalance)) {
      feeIncome = feeIncome.plus(payment.amount);
      return {
        ...payment,
        amount: new BigNumber(0),
        fee: payment.amount,
        note: ENoteType.BalanceBelowMinimum,
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
