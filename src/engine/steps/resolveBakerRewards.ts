import { isOverDelegated } from "src/engine/helpers";
import { StepArguments } from "src/engine/interfaces";
import { divide, multiply, subtract } from "src/utils/math";

export const resolveBakerRewards = (args: StepArguments): StepArguments => {
  const { config, cycleData, cycleReport, distributableRewards } = args;
  const {
    cycleDelegatedBalance,
    cycleStakingBalance,
    cycleRewards,
    frozenDepositLimit,
  } = cycleData;
  const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);
  let bakerRewards;
  if (
    config.overdelegation_guard &&
    isOverDelegated(bakerBalance, cycleStakingBalance, frozenDepositLimit)
  ) {
    bakerRewards = multiply(cycleRewards, 0.1);
  } else {
    bakerRewards = multiply(
      cycleRewards,
      divide(bakerBalance, cycleStakingBalance)
    );
  }

  return {
    ...args,
    cycleReport: { ...cycleReport, lockedBondRewards: bakerRewards },
    distributableRewards: subtract(distributableRewards, bakerRewards),
  };
};
