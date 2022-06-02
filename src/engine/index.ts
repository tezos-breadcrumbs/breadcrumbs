import { StepArguments, StepFunction } from "./interfaces";
import {
  resolveBakerRewards,
  resolveBondRewardDistribution,
  resolveDelegatorRewards,
  resolveExcludedDelegators,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveFeeIncomeDistribution,
} from "./steps";

const steps: StepFunction[] = [
  resolveBakerRewards,
  resolveExcludedDelegators,
  resolveDelegatorRewards,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveFeeIncomeDistribution,
  resolveBondRewardDistribution,
];

function run(
  args: StepArguments,
  remainingSteps: StepFunction[] = steps
): StepArguments {
  if (!remainingSteps.length) return args; /* base case */

  const nextArgs = remainingSteps[0](args);
  const nextSteps = remainingSteps.slice(1);

  return run(nextArgs, nextSteps);
}

export default { run };
