import { filter, isEmpty } from "lodash";
import {
  BasePayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import { divide, multiply, integerize } from "src/utils/math";
import { paymentAmountRequirementsFactory } from "../validate";

export const resolveFeeIncomeDistribution = (
  args: StepArguments
): StepArguments => {
  const {
    config,
    cycleReport: { feeIncome },
  } = args;

  const skip = isEmpty(config.fee_income_recipients);

  if (skip) {
    return args;
  } else {
    const payments: BasePayment[] = [];
    for (const recipient in config.fee_income_recipients) {
      const share = divide(config.fee_income_recipients[recipient], 1);
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
    const feeIncomePayments = filter(
      payments,
      paymentAmountRequirementsFactory
    );

    return {
      ...args,
      cycleReport: { ...args.cycleReport, feeIncomePayments },
    };
  }
};
