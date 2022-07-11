import { StepArguments } from "src/engine/interfaces";
import {
  paymentAmountAboveZeroFactory,
  paymentContextRequirementsFactory,
} from "src/engine/validate";

export const resolveExcludedPaymentsByContext = (
  args: StepArguments
): StepArguments => {
  const { cycleReport, config } = args;

  const delegatorPayments = cycleReport.delegatorPayments
    .filter(paymentContextRequirementsFactory(config))
    .filter(paymentAmountAboveZeroFactory);

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      delegatorPayments,
    },
  };
};
