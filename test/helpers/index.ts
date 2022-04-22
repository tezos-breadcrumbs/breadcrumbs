import { Config } from "src/config/interface";

export const generateConfig = (
  args: { overdelegation_guard?: boolean } = {}
): Config => {
  return {
    baking_address: "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur",
    default_fee: "5",
    redirect_payments: {},
    fee_exceptions: {},
    overdelegation_guard: args.overdelegation_guard || false,
  };
};
