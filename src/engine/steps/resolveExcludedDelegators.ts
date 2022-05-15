import _ from "lodash";
import { StepArguments } from "src/engine/interfaces";

const resolveExcludedDelegators = (args: StepArguments): StepArguments => {
  const { config, cycleData } = args;
  const { cycleShares } = cycleData;

  const updatedCycleShares = _.reject(cycleShares, (share) =>
    _.includes(config.overdelegation_blacklist, share.address)
  );

  return {
    ...args,
    cycleData: { ...cycleData, cycleShares: updatedCycleShares },
  };
};

export default resolveExcludedDelegators;
