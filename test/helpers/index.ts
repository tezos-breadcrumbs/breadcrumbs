import { BreadcrumbsConfiguration } from "src/config/interfaces";
import { parseInt } from "src/utils/parse";

const DEFAULT_BAKER = "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur";

export const generateConfig = (
  args: {
    baking_address?: string;
    overdelegation_guard?: boolean;
    overdelegation_blacklist?: string[];
    redirect_payments?: { [key: string]: string };
    fee_exceptions?: { [key: string]: string };
    default_fee?: string;
    minimum_payment_amount?: string;
    minimum_delegator_balance?: string;
    fee_income_recipients?: { [key: string]: string };
    bond_reward_recipients?: { [key: string]: string };
  } = {}
): BreadcrumbsConfiguration => {
  return {
    baking_address: args.baking_address || DEFAULT_BAKER,
    default_fee: parseInt(args.default_fee, 5),
    redirect_payments: args.redirect_payments || {},
    fee_exceptions: args.fee_exceptions || {},
    overdelegation_guard: args.overdelegation_guard || false,
    overdelegation_blacklist: args.overdelegation_blacklist || [],
    minimum_payment_amount: parseInt(args.minimum_payment_amount, 0),
    minimum_delegator_balance: parseInt(args.minimum_delegator_balance, 0),
    fee_income_recipients: args.fee_income_recipients || {},
    bond_reward_recipients: args.bond_reward_recipients || {},
  };
};
