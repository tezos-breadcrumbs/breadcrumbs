import {
  BreadcrumbsConfiguration,
  EPayoutWalletMode,
} from "src/config/interfaces";
import { parseInt } from "src/utils/parse";

const DEFAULT_BAKER = "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur";

export const generateConfig = (
  args: Partial<BreadcrumbsConfiguration> = {}
): BreadcrumbsConfiguration => {
  return {
    baking_address: args.baking_address || DEFAULT_BAKER,
    default_fee: parseInt(args.default_fee, 5),
    accounting_mode: args.accounting_mode ?? false,
    payout_wallet_mode:
      args.payout_wallet_mode ?? EPayoutWalletMode.LocalPrivateKey,
    network_configuration: {
      rpc_url: "https://ghostnet.ecadinfra.com",
      suppress_KT_payments:
        args.network_configuration?.suppress_KT_payments ?? false,
    },
    delegator_requirements: {
      minimum_balance: args.delegator_requirements?.minimum_balance ?? 0,
    },
    delegator_overrides: args.delegator_overrides,
    income_recipients: {
      fee_income: args.income_recipients?.fee_income ?? {},
      bond_rewards: args.income_recipients?.bond_rewards ?? {},
    },
    overdelegation: {
      guard: args.overdelegation?.guard ?? false,
      excluded_addresses: args.overdelegation?.excluded_addresses ?? [],
    },
    payment_requirements: {
      minimum_amount: args.payment_requirements?.minimum_amount ?? 0,
      baker_pays_transaction_fee:
        args.payment_requirements?.baker_pays_transaction_fee ?? false,
    },
  };
};
