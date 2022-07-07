import { NotificationPluginConfiguration } from "src/plugin/notification/interfaces";

interface PaymentRequirements {
  baker_pays_transaction_fee?: boolean;
  minimum_amount?: number;
}
interface OverdelegationConfiguration {
  guard?: boolean;
  excluded_addresses?: string[];
}

interface DelegatorRequirements {
  minimum_balance?: number;
}

interface DelegatorOverrides {
  [key: string]: {
    fee?: number;
    recipient?: string;
  };
}

interface NetworkConfiguration {
  rpc_url: string;
  suppress_KT_payments?: boolean;
}

interface IncomeRecipientsConfiguration {
  bond_rewards?: {
    [key: string]: number;
  };
  fee_income?: {
    [key: string]: number;
  };
}

export enum EPayoutWalletMode {
  LocalPrivateKey = "local-private-key",
  Ledger = "ledger",
}

export interface BreadcrumbsConfiguration {
  baking_address: string;
  default_fee: number;
  payout_wallet_mode: EPayoutWalletMode;
  network_configuration: NetworkConfiguration;

  delegator_overrides?: DelegatorOverrides;
  delegator_requirements?: DelegatorRequirements;
  income_recipients?: IncomeRecipientsConfiguration;
  overdelegation?: OverdelegationConfiguration;
  payment_requirements?: PaymentRequirements;

  /* Experimental */
  accounting_mode?: boolean;
  notifications: Array<NotificationPluginConfiguration>;
}
