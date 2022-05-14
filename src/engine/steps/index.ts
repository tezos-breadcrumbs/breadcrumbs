import { StepArguments } from "src/engine/interfaces";
import { resolveBakerRewards } from "./resolveBakerRewards";
import { resolveDelegatorRewards } from "./resolveDelegatorRewards";
import { resolveExcludedDelegators } from "./resolveExcludedDelegators";
import { resolveExcludedPayments } from "./resolveExcludedPayments";

interface Steps {
  [key: string]: (args: StepArguments) => StepArguments;
}

const steps: Steps = {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
  resolveExcludedPayments,
};

export default steps;
