import _ from "lodash";
import { StepArguments } from "src/engine/interfaces";

export const resolveExcludedDelegators = (
  args: StepArguments
): StepArguments => {
  const { config, cycleData } = args;
  const { cycleShares } = cycleData;

  const updatedCycleShares = _.reject(cycleShares, (share) =>
    _.includes(config.overdelegation?.excluded_addresses ?? [], share.address)
  );

  return {
    ...args,
    cycleData: { ...cycleData, cycleShares: updatedCycleShares },
  };
};
