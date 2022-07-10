import { StepArguments, StepFunction } from "./interfaces";
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
  resolveExcludeDistributed,
  resolveSufficientBalance,
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
  resolveExcludeDistributed,
  resolveSplitIntoBatches,
  resolveSufficientBalance,
];

const run = async (
  args: StepArguments,
  remainingSteps: StepFunction[] = steps
): Promise<StepArguments> => {
  if (!remainingSteps.length) return args; /* base case */

  const nextArgs = await remainingSteps[0](args);
  const nextSteps = remainingSteps.slice(1);

  return await run(nextArgs, nextSteps);
};

export default { run };
