import { StepFunction } from "src/engine/interfaces";
import resolveBakerRewards from "./resolveBakerRewards";
import resolveDelegatorRewards from "./resolveDelegatorRewards";
import resolveExcludedDelegators from "./resolveExcludedDelegators";
import resolveExcludedPayments from "./resolveExcludedPayments";

const steps: { [key: string]: StepFunction } = {
  resolveBakerRewards,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
  resolveExcludedPayments,
};

export default steps;
