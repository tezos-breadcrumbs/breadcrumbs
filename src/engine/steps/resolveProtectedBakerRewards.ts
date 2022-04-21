import { isOverDelegated } from "src/engine/helpers";
import { StepArguments } from "src/engine/interfaces";
import { multiply, subtract } from "src/utils/math";

export const resolveProtectedBakerRewards = (
  args: StepArguments
): StepArguments => {
  const { config, cycleData, cycleReport, distributableRewards } = args;
  const {
    cycleDelegatedBalance,
    cycleStakingBalance,
    cycleShares,
    cycleRewards,
  } = cycleData;
  const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);

  if (
    config.overdelegation_guard &&
    isOverDelegated(bakerBalance, cycleStakingBalance)
  ) {
    const bakerRewards = multiply(cycleRewards, 0.1);

    return {
      ...args,
      cycleReport: { ...cycleReport, lockedBondRewards: bakerRewards },
      distributableRewards: subtract(distributableRewards, bakerRewards),
    };
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
