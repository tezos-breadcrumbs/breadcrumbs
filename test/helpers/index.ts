import { Config } from "src/config";

const DEFAULT_BAKER = "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur";

export const generateConfig = (
  args: {
    baking_address?: string;
    overdelegation_guard?: boolean;
    overdelegation_blacklist?: string[];
    redirect_payments?: { [key: string]: string };
    fee_exceptions?: { [key: string]: string };
    default_fee?: string;
  } = {}
): Config => {
  return {
    baking_address: args.baking_address || DEFAULT_BAKER,
    default_fee: args.default_fee || "5",
    redirect_payments: args.redirect_payments || {},
    fee_exceptions: args.fee_exceptions || {},
    overdelegation_guard: args.overdelegation_guard || false,
    overdelegation_blacklist: args.overdelegation_blacklist || [],
  };
};
