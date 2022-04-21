import { StepArguments } from "src/engine/interfaces";
import { resolveProtectedBakerRewards } from "./resolveProtectedBakerRewards";

interface Steps {
  [key: string]: (args: StepArguments) => StepArguments;
}

const steps: Steps = {
  resolveProtectedBakerRewards,
};

export default steps;
