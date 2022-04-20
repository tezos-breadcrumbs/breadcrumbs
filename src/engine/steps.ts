import { isOverDelegated } from "src/engine/helpers";
import { StepArguments } from "src/engine/interfaces";
import { subtract } from "src/utils/math";

const resolveProtectedBakerRewards = (args: StepArguments): StepArguments => {
  const { config, cycleData } = args;
  const { cycleDelegatedBalance, cycleStakingBalance, cycleShares } = cycleData;
  const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);

  if (
    config.overdelegation_guard &&
    isOverDelegated(bakerBalance, cycleStakingBalance)
  ) {
    // allocate baker 10% of rewards
    return args;
  } else {
    const updatedCycleShares = [
      ...cycleShares,
      { address: config.baking_address, balance: bakerBalance },
    ];

    return {
      ...args,
      cycleData: { ...cycleData, cycleShares: updatedCycleShares },
    };
  }
};
