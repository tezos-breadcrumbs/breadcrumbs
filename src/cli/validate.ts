import { parseInt } from "lodash";
import { isPKH } from "src/config/validate/helpers";
import { ENotificationPluginKind } from "src/plugin/notification/interfaces";

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

export const validateNotificationType = (type) => {
  if (
    type === undefined ||
    Object.values(ENotificationPluginKind).includes(type)
  )
    return type;
  throw Error("Invalid notification plugin type.");
};
