import { StepArguments } from "src/engine/interfaces";
import { paymentContextRequirementsFactory } from "src/engine/validate";

export const resolveExcludeByTxContext = (
  args: StepArguments
): StepArguments => {
  const { cycleReport, config } = args;

  const delegatorPayments = cycleReport.delegatorPayments.filter(
    paymentContextRequirementsFactory(config)
  );

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      delegatorPayments,
    },
  };
};
