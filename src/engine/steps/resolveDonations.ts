import { filter, isEmpty } from "lodash";
import {
  BasePayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import { add, divide, multiply, integerize } from "src/utils/math";
import { paymentAmountAboveZeroFactory } from "../validate";

export const resolveFeeIncomeDistribution = (
  args: StepArguments
): StepArguments => {
  const {
    config,
    cycleReport: { feeIncome, lockedBondRewards },
  } = args;

  const skip = isEmpty(config.donations);

  if (skip) {
    return args;
  } else {
    const payments: BasePayment[] = [];
    for (const recipient in config.donations) {
      const share = divide(config.donations[recipient], 100);
      const payable = integerize(
        add(multiply(share, feeIncome), multiply(share, lockedBondRewards))
      );

      const payment = {
        type: EPaymentType.Donation,
        cycle: args.cycleReport.cycle,
        recipient,
        amount: payable,
        hash: "",
      };
      payments.push(payment);
    }
    /* Sanity check */
    const donationPayments = filter(payments, paymentAmountAboveZeroFactory);

    return {
      ...args,
      cycleReport: { ...args.cycleReport, donationPayments },
    };
  }
};
