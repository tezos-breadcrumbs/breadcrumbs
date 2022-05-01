import { StepArguments } from "src/engine/interfaces";
import { resolveBakerRewards } from "./resolveBakerRewards";
import { resolveDelegatorRewards } from "./resolveDelegatorRewards";

interface Steps {
  [key: string]: (args: StepArguments) => StepArguments;
}

const steps: Steps = {
  resolveBakerRewards,
  resolveDelegatorRewards,
};

export default steps;
