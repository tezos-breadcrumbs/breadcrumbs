import { filter, isEmpty } from "lodash";
import {
  BasePayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import { divide, multiply, integerize } from "src/utils/math";
import { paymentAmountAboveZeroFactory } from "../validate";

export const resolveFeeIncomeDistribution = (
  args: StepArguments
): StepArguments => {
  const {
    config,
    cycleReport: { feeIncome },
  } = args;

  const skip = isEmpty(config.income_recipients?.fee_income);

  if (skip) {
    return args;
  } else {
    const payments: BasePayment[] = [];
    for (const recipient in config.income_recipients?.fee_income) {
      const share = divide(
        config.income_recipients?.fee_income[recipient] ?? 0,
        100
      );
      const payable = integerize(multiply(share, feeIncome));

      const payment = {
        type: EPaymentType.FeeIncome,
        cycle: args.cycleReport.cycle,
        recipient,
        amount: payable,
        hash: "",
      };

      payments.push(payment);
    }

    /* Sanity check */
    const feeIncomePayments = filter(payments, paymentAmountAboveZeroFactory);

    return {
      ...args,
      cycleReport: { ...args.cycleReport, feeIncomePayments },
    };
  }
};
