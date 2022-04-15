import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export const add = (a: BigNumberish, b: BigNumberish) => {
  return BigNumber.from(a).add(b);
};

export const subtract = (a: BigNumberish, b: BigNumberish) => {
  return BigNumber.from(a).sub(b);
};

export const multiply = (a: BigNumberish, b: BigNumberish) => {
  return BigNumber.from(a).mul(b);
};

export const divide = (a: BigNumberish, b: BigNumberish) => {
  return BigNumber.from(a).div(b);
};

export const sum = (...args: BigNumberish[]) => {
  return args.reduce(add);
};
