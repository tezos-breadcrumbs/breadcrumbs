import { filter, isEmpty } from "lodash";
import {
  BasePayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import { add, divide, multiply, integerize } from "src/utils/math";
import { paymentAmountAboveZeroFactory } from "../validate";

export const resolveDonations = (args: StepArguments): StepArguments => {
  const {
    config,
    cycleReport: { feeIncome, lockedBondRewards },
  } = args;
  const skip = isEmpty(config.donations);
  if (skip) {
    return args;
  } else {
    const payments: BasePayment[] = [];
    let updateFeeIncome = feeIncome;
    let updatedBondRewards = lockedBondRewards;

    for (const recipient in config.donations) {
      const share = divide(config.donations[recipient], 100);
      const feeIncomeDonation = integerize(multiply(share, feeIncome));
      const bondRewardDonation = integerize(multiply(share, lockedBondRewards));
      const payable = add(feeIncomeDonation, bondRewardDonation);

      const payment = {
        type: EPaymentType.Donation,
        cycle: args.cycleReport.cycle,
        recipient,
        amount: payable,
        hash: "",
      };
      payments.push(payment);

      updatedBondRewards = updatedBondRewards.minus(bondRewardDonation);
      updateFeeIncome = updateFeeIncome.minus(feeIncomeDonation);
    }
    /* Sanity check */
    const donationPayments = filter(payments, paymentAmountAboveZeroFactory);
    return {
      ...args,
      cycleReport: {
        ...args.cycleReport,
        donationPayments,
        lockedBondRewards: updatedBondRewards,
        feeIncome: updateFeeIncome,
      },
    };
  }
};
