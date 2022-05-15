import _ from "lodash";
import { Payment, StepArguments } from "src/engine/interfaces";
import { getMinimumPaymentAmount } from "src/engine/helpers";
import BigNumber from "bignumber.js";

const resolveExcludedPayments = (args: StepArguments): StepArguments => {
  const { config, cycleReport } = args;

  const MUTEZ_MULTIPLIER = 1000000;
  const minimumPaymentAmount =
    getMinimumPaymentAmount(config).times(MUTEZ_MULTIPLIER);

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      payments: _.map(
        cycleReport.payments,
        (payment): Payment =>
          payment.amount.lt(minimumPaymentAmount)
            ? { ...payment, amount: new BigNumber(0) }
            : payment
      ),
    },
  };
};

export default resolveExcludedPayments;
