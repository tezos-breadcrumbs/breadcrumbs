import { InMemorySigner } from "@taquito/signer";
import Joi from "joi";
import { isPKH } from "src/config/validate/helpers";
import { EPayoutWalletMode } from "../interfaces";

type inquirerValidator = (any) => boolean | string;

export const validBakingAddress: inquirerValidator = (input) => {
  return isPKH(input) ? true : "Please enter a valid address.";
};

export const validPercentage: inquirerValidator = (input) => {
  const result = Joi.number().min(0).max(100).validate(input);
  return result.error ? "Please enter a valid percentage." : true;
};

export const validPrivateKey = async (input) => {
  try {
    const _signer = await InMemorySigner.fromSecretKey(input);
    return true;
  } catch {
    return "Invalid private key provided";
  }
};

export const filterRpcUrl = (input) => {
  return input.split("|")[1];
};

export const filterWalletMode = (input) => {
  if (input === "Ledger") return EPayoutWalletMode.Ledger;
  else return EPayoutWalletMode.PrivateKey;
};
