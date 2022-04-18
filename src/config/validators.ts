import {
  validateKeyHash,
  validateAddress /* Accepts KT addresses */,
  ValidationResult,
} from "@taquito/utils";

type inquirerValidator = (any) => boolean | string;

export const validAddress: inquirerValidator = (input) => {
  return validateKeyHash(input) === ValidationResult.VALID
    ? true
    : "Please enter a valid address.";
};

export const validPercentage: inquirerValidator = (input) => {
  return parseFloat(input) < 0 || parseFloat(input) > 100
    ? "Please enter a valid percentage."
    : true;
};

export const validRedirect: inquirerValidator = (input) => {
  if (input === null) return true;
  for (const delegator in input) {
    if (
      validateAddress(delegator) !== ValidationResult.VALID ||
      validateAddress(input[delegator]) !== ValidationResult.VALID
    )
      return "Please specify redirects in the form '<delegator_address>:<payment_address>',<delegator_address>:<payment_address>, ...'";
  }
  return true;
};

export const validFeeExceptions: inquirerValidator = (input) => {
  if (input === null) return true;
  for (const delegator in input) {
    const fee = input[delegator];
    if (
      validateAddress(delegator) !== ValidationResult.VALID ||
      validPercentage(fee) !== true
    )
      return "Please specify exceptions in the form '<delegator_address>:<percentage_fee>',<delegator_address>:<percentage_fee>, ...'";
  }
  return true;
};
