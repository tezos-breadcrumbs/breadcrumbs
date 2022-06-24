import Joi from "joi";
import { values, sum } from "lodash";
import { isAddress, isPKH } from "./helpers";

const validPKH = Joi.custom((i) => {
  if (isPKH(i)) return i;
  else throw Error("input must be a valid public key hash");
});

const validAddress = Joi.custom((i) => {
  if (isAddress(i)) return i;
  else throw Error("input must be a valid address");
});

const validPercentage = Joi.number().min(0).max(100);

const validOverdelegationExcludedAddresses = Joi.array().items(validAddress);

const validDelegatorOverrides = Joi.object().pattern(
  validAddress,
  Joi.object({ fee: validPercentage, recipient: validAddress })
);

const validDistributionShares = Joi.custom((i) => {
  const result = Joi.object()
    .pattern(validAddress, validPercentage)
    .validate(i);
  console.log(result);
  if (result.error) {
    throw Error(result.error.message);
  } else {
    if (sum(values(i)) == 100) return i;
    else throw Error("sum of distribution shares must equal 100%");
  }
});

const validRpcUrl = Joi.string().uri({ scheme: ["https"] });

export const schema = Joi.object({
  baking_address: validPKH,
  default_fee: validPercentage.required(),
  delegator_overrides: validDelegatorOverrides,
  delegator_requirements: {
    minimum_balance: Joi.number().positive(),
  },
  income_recipients: {
    bond_rewards: validDistributionShares,
    fee_income: validDistributionShares,
  },
  network_configuration: {
    rpc_url: validRpcUrl.required(),
    suppress_KT_payments: Joi.boolean(),
  },
  overdelegation: {
    excluded_address: validOverdelegationExcludedAddresses,
    guard: Joi.boolean(),
  },
  payment_requirements: {
    baker_pays_transaction_fee: Joi.boolean(),
    minimum_amount: Joi.number().positive(),
  },
});
