import BigNumber from "bignumber.js";

type BigNumberish = string | number | BigNumber;

export const add = (a: BigNumberish, b: BigNumberish) => {
  return new BigNumber(a).plus(b);
};

export const subtract = (a: BigNumberish, b: BigNumberish) => {
  return new BigNumber(a).minus(b);
};

export const multiply = (a: BigNumberish, b: BigNumberish) => {
  return new BigNumber(a).times(b);
};

export const divide = (a: BigNumberish, b: BigNumberish) => {
  return new BigNumber(a).div(b);
};

export const sum = (...args: BigNumberish[]): BigNumber => {
  let total = new BigNumber(0);
  for (const i of args) {
    total = add(total, i);
  }
  return total;
};
