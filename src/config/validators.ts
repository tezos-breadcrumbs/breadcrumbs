import {
  validateKeyHash,
  validateAddress /* Accepts KT addresses */,
  ValidationResult,
} from "@taquito/utils";
import _ from "lodash";

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

export const validAddressList: inquirerValidator = (input) => {
  for (const delegator of input) {
    if (validateAddress(delegator) !== ValidationResult.VALID)
      return "Please enter valid address separated by a comma.";
  }
  return true;
};

export const validNumber: inquirerValidator = (input) => {
  if (_.isNumber(Number(input))) return true;
  else return "Please enter a valid number";
};

export const validDistributionShares: inquirerValidator = (input) => {
  if (_.isEmpty(input)) return true;
  for (const recipient in input) {
    if (validateAddress(recipient) !== ValidationResult.VALID)
      return "Please enter valid addresses for all recipients'";

    if (
      _.isNumber(input[recipient]) &&
      input[recipient] >= 0 &&
      input[recipient] <= 1
    ) {
      return "Please enter a number between 0 and 1 for each recipient share";
    }
  }

  const sum = _.sum(_.values(input).map(Number));

  if (sum !== 1) {
    return "The sum of shares must equal 1";
  }

  return true;
};
