import { BigNumber } from "bignumber.js";
import _ from "lodash";

export const filterRedirects = (input): { [key: string]: string } | null => {
  if (input === "") return {};
  const list = input.split(",");
  const result = {};
  for (const pair of list) {
    const [delegator, target] = pair.trim().split(":");
    result[delegator] = target;
  }
  return result;
};

export const filterFeeExceptions = (
  input
): { [key: string]: string } | null => {
  if (input === "") return {};

  const list = input.split(",");
  const result = {};
  for (const pair of list) {
    const [delegator, fee] = pair.trim().split(":");
    result[delegator] = fee;
  }
  return result;
};

export const filterOverDelegationBlacklist = (input: string): string[] => {
  if (input === "") return [];
  else return _.uniq(_.map(input.split(","), (v) => v.trim()));
};

export const filterNumber = (input: string): string => {
  return new BigNumber(input).toString();
};

export const filterDistributionShares = (
  input
): { [key: string]: string } | null => {
  if (input === "") return {};

  const list = input.split(",");
  const result = {};

  for (const pair of list) {
    const [recipient, share] = pair.trim().split(":");
    result[recipient] = share;
  }
  return result;
};
