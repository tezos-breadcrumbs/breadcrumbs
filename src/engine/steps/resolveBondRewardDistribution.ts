import { isEmpty, filter } from "lodash";
import {
  BasePayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import { divide, multiply, integerize } from "src/utils/math";
import { paymentAmountRequirementsFactory } from "../validate";

export const resolveBondRewardDistribution = (
  args: StepArguments
): StepArguments => {
  const {
    config,
    cycleReport: { lockedBondRewards },
  } = args;

  const skip = isEmpty(config.income_recipients?.bond_rewards);

  if (skip) {
    return args;
  } else {
    const payments: BasePayment[] = [];
    for (const recipient in config.income_recipients?.bond_rewards) {
      const share = divide(
        config.income_recipients?.bond_rewards[recipient] ?? 0,
        100
      );
      const payable = integerize(multiply(share, lockedBondRewards));

      const payment = {
        type: EPaymentType.BondReward,
        cycle: args.cycleReport.cycle,
        recipient,
        amount: payable,
        hash: "",
      };

      payments.push(payment);
    }

    /* Sanity check */
    const bondRewardPayments = filter(
      payments,
      paymentAmountRequirementsFactory
    );

    return {
      ...args,
      cycleReport: { ...args.cycleReport, bondRewardPayments },
    };
  }
};
