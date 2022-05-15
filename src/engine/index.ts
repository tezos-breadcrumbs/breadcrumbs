import { StepArguments, StepFunction } from "./interfaces";

import resolveBakerRewards from "./steps/resolveBakerRewards";
import resolveDelegatorRewards from "./steps/resolveDelegatorRewards";
import resolveExcludedDelegators from "./steps/resolveExcludedDelegators";
import resolveExcludedPayments from "./steps/resolveExcludedPayments";

const steps: StepFunction[] = [
  resolveBakerRewards,
  resolveExcludedDelegators,
  resolveDelegatorRewards,
  resolveExcludedPayments,
];

export function run(
  args,
  remainingSteps: StepFunction[] = steps
): StepArguments {
  if (!remainingSteps.length) return args; /* base case */

  const nextArgs = remainingSteps[0](args);
  const nextSteps = remainingSteps.slice(1);

  return run(nextArgs, nextSteps);
}
