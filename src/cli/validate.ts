import { parseInt } from "lodash";
import { isPKH } from "src/config/validate/helpers";

export const validateCycleOpt = (value) => {
  const cycle = parseInt(value);
  if (isNaN(cycle)) {
    throw Error("No cycle number given.");
  }
  return cycle;
};

export const validAddress = (value) => {
  if (isPKH(value)) return value;
  else throw Error("Invalid address given.");
};
