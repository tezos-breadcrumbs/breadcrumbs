import {
  BreadcrumbsConfiguration,
  BreadcrumbsNetworkConfiguration,
} from "src/config/interfaces";
import { parseInt, parseFloat } from "src/utils/parse";

const DEFAULT_BAKER = "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur";

export const generateConfig = (
  args: Partial<BreadcrumbsConfiguration> = {}
): BreadcrumbsConfiguration => {
  return {
    baking_address: args.baking_address || DEFAULT_BAKER,
    network_configuration: Object.assign(
      {
        rpc: "https://ithacanet.ecadinfra.com",
        suppress_smartcontract_payments: true,
        explorer_addr_format: "https://ithacanet.tzkt.io/<ophash>",
      } as BreadcrumbsNetworkConfiguration,
      args.network_configuration
    ),
    default_fee: parseInt(args.default_fee, 5),
    redirect_payments: args.redirect_payments || {},
    fee_exceptions: args.fee_exceptions || {},
    overdelegation_guard: args.overdelegation_guard || false,
    overdelegation_blacklist: args.overdelegation_blacklist || [],
    minimum_payment_amount: parseFloat(args.minimum_payment_amount, 0),
    minimum_delegator_balance: parseInt(args.minimum_delegator_balance, 0),
    fee_income_recipients: args.fee_income_recipients || {},
    bond_reward_recipients: args.bond_reward_recipients || {},
    baker_pays_tx_fee: args.baker_pays_tx_fee || false,
  };
};
