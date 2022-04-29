import { StepArguments } from "src/engine/interfaces";
import { resolveBakerRewards } from "./resolveBakerRewards";

interface Steps {
  [key: string]: (args: StepArguments) => StepArguments;
}

const steps: Steps = {
  resolveBakerRewards,
};

export default steps;
