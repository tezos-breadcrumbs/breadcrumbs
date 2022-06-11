import { EngineOptions, StepArguments, StepFunction } from "./interfaces";
import {
  resolveBakerRewards,
  resolveBondRewardDistribution,
  resolveDelegatorRewards,
  resolveEstimateTxFees,
  resolveExcludedDelegators,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveFeeIncomeDistribution,
  resolveSplitIntoBatches,
  resolveSubstractTxFees,
  resolveExcludeByTxContext,
} from "./steps";

const steps: StepFunction[] = [
  resolveBakerRewards,
  resolveExcludedDelegators,
  resolveDelegatorRewards,
  resolveExcludeByTxContext,
  resolveEstimateTxFees,
  resolveExcludedPaymentsByMinimumAmount,
  resolveExcludedPaymentsByMinimumDelegatorBalance,
  resolveSubstractTxFees,
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
