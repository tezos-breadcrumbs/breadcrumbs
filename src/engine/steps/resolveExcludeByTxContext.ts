import { StepArguments } from "src/engine/interfaces";
import {
  paymentContextRequirements,
  paymentRequirementsMetFactory,
} from "../validate";

export const resolveExcludeByTxContext = (
  args: StepArguments
): StepArguments => {
  const { cycleReport } = args;

  const delegatorPayments = cycleReport.delegatorPayments.filter(
    paymentRequirementsMetFactory(paymentContextRequirements)
  );

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      delegatorPayments,
    },
  };
};
