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

  const skip = isEmpty(config.bond_reward_recipients);

  if (skip) {
    return args;
  } else {
    const payments: BasePayment[] = [];
    for (const recipient in config.bond_reward_recipients) {
      const share = divide(config.bond_reward_recipients[recipient], 1);
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
