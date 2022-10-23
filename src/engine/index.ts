import { StepArguments, StepFunction, Flags } from "./interfaces";
import { Optional } from "utility-types";
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
  resolveDonations,
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
  resolveDonations,
  resolveFeeIncomeDistribution,
  resolveBondRewardDistribution,
  resolveExcludeDistributed,
  resolveSplitIntoBatches,
  resolveSufficientBalance,
];

const run = async (
  args: Optional<StepArguments, "flags">,
  remainingSteps: StepFunction[] = steps
): Promise<StepArguments> => {
  if (!args.flags) args.flags = {} as Flags;
  if (!remainingSteps.length) return args as StepArguments; /* base case */

  const nextArgs = await remainingSteps[0](args as StepArguments);
  const nextSteps = remainingSteps.slice(1);

  return await run(nextArgs, nextSteps);
};

export default { run };
