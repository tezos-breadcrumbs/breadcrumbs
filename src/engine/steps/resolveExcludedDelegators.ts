import { includes, reject } from "lodash";
import { StepArguments } from "src/engine/interfaces";

export const resolveExcludedDelegators = (
  args: StepArguments
): StepArguments => {
  const { config, cycleData } = args;
  const { cycleShares } = cycleData;

  const updatedCycleShares = reject(cycleShares, (share) =>
    includes(config.overdelegation?.excluded_addresses ?? [], share.address)
  );

  return {
    ...args,
    cycleData: { ...cycleData, cycleShares: updatedCycleShares },
  };
};
