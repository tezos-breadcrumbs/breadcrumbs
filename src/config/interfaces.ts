export enum EPayoutWalletMode {
  PrivateKey = "private-key",
  Ledger = "ledger",
}

export interface BreadcrumbsNetworkConfiguration {
  rpc: string;
  suppress_smartcontract_payments?: boolean;
  explorer_addr_format?: "https://ithacanet.tzkt.io/<ophash>";
}

export interface BreadcrumbsConfiguration {
  baking_address: string;
  network_configuration?: BreadcrumbsNetworkConfiguration;
  default_fee: number;
  payout_wallet_mode?: EPayoutWalletMode;
  redirect_payments?: { [key: string]: string };
  fee_exceptions?: { [key: string]: string };
  baker_pays_tx_fee?: boolean;
  accounting_mode?: boolean;
  overdelegation_guard?: boolean;
  overdelegation_blacklist?: string[];
  minimum_payment_amount?: number;
  minimum_delegator_balance?: number;
  fee_income_recipients?: { [key: string]: string };
  bond_reward_recipients?: { [key: string]: string };
}
