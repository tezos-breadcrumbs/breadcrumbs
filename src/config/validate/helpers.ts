import {
  validateAddress,
  validateKeyHash,
  ValidationResult,
} from "@taquito/utils";

export const isPKH = (i) => validateKeyHash(i) === ValidationResult.VALID;
export const isAddress = (i) => validateAddress(i) === ValidationResult.VALID;
