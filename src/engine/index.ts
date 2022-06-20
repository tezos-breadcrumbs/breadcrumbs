import { EngineOptions, StepArguments, StepFunction } from "./interfaces";
import {
  resolveBakerRewards,
  resolveBondRewardDistribution,
  resolveDelegatorRewards,
  resolveEstimateTransactionFees,
  resolveExcludedDelegators,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveFeeIncomeDistribution,
  resolveSplitIntoBatches,
  resolveSubstractTransactionFees,
  resolveExcludedPaymentsByContext,
} from "./steps";

const steps: StepFunction[] = [
  resolveBakerRewards,
  resolveExcludedDelegators,
  resolveDelegatorRewards,
  resolveExcludedPaymentsByContext,
  resolveEstimateTransactionFees,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveSubstractTransactionFees,
  resolveFeeIncomeDistribution,
  resolveBondRewardDistribution,
  resolveSplitIntoBatches,
];

const run = async (
  args: StepArguments,
  options: EngineOptions,
  remainingSteps: StepFunction[] = steps
): Promise<StepArguments> => {
  if (!remainingSteps.length) return args; /* base case */

  const nextArgs = await remainingSteps[0](args, options);
  const nextSteps = remainingSteps.slice(1);

  return await run(nextArgs, options, nextSteps);
};

export default { run };
