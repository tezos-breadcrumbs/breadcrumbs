import BigNumber from "bignumber.js";
import { CycleData } from "src/client/abstract_client";
import { Config } from "src/config/interface";
import { CycleReport } from "src/engine/interfaces";

const resolveProtectedBakerRewards = (
  config: Config,
  cycleData: CycleData,
  cycleReport: CycleReport,
  distributableRewards: BigNumber
) => {
  if (config.overdelegation_guard === false) {
    /* Place baker stake among delegator stakes */
  } else {
      /* If over-delegated, allocate baker 10% of rewards
      /* If not over delegated, Place baker stake among delegator stakes
  }
};
