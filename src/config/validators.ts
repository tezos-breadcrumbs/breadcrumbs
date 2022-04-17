import {
  validateKeyHash,
  validateAddress,
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
  const list = Object.keys(input).map((key) => ({ key, value: input[key] }));

  for (const redirect in list) {
    const [delegator, target] = redirect;
    if (
      validateAddress(delegator) !== ValidationResult.VALID ||
      validateAddress(target) !== ValidationResult.VALID
    )
      return "Please enter rules in the form '<delegator_address>:<payment_address>',<delegator_address>:<payment_address>'";
  }
  return true;
};
