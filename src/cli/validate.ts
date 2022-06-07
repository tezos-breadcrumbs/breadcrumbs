import { parseInt } from "lodash";

export const validateCycleOpt = (value) => {
  const cycle = parseInt(value);
  if (isNaN(cycle)) {
    throw Error("No cycle number given.");
  }
  return cycle;
};
