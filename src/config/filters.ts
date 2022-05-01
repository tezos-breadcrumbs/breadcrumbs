import _ from "lodash";

export const filterRedirects = (
  input: any
): { [key: string]: string } | null => {
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
  input: any
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
