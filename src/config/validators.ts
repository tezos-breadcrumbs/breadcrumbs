import { validateKeyHash, ValidationResult } from "@taquito/utils";

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
