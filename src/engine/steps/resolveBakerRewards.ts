import { isOverDelegated } from "src/engine/helpers";
import { StepArguments } from "src/engine/interfaces";
import { divide, multiply, subtract, integerize } from "src/utils/math";

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
    bakerRewards = divide(cycleRewards, 10);
  } else {
    bakerRewards = multiply(
      cycleRewards,
      divide(bakerBalance, cycleStakingBalance)
    );
  }

  // TODO: add accounted from last cycle

  /* Standardize to mutez */
  bakerRewards = integerize(bakerRewards);

  return {
    ...args,
    cycleReport: { ...cycleReport, lockedBondRewards: bakerRewards },
    distributableRewards: subtract(distributableRewards, bakerRewards),
  };
};
