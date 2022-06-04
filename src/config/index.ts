export interface BreadcrumbsConfiguration {
  baking_address: string;
  default_fee: number;
  redirect_payments?: { [key: string]: string };
  fee_exceptions?: { [key: string]: string };
  overdelegation_guard?: boolean;
  overdelegation_blacklist?: string[];
  minimum_payment_amount?: number;
  minimum_delegator_balance?: number;
  fee_income_recipients?: { [key: string]: string };
  bond_reward_recipients?: { [key: string]: string };
}
