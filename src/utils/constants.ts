import { join } from "path";

export const MUTEZ_FACTOR = 1000000;

// configuration files
export const CONFIG_FILE = `config.hjson`;
export const WALLET_PRIVATE_KEY_FILE = `payout_wallet_private.key`;
export const REMOTE_SIGNER_CONFIG_FILE = `remote-signer.hjson`;
export const LEDGER_SIGNER_CONFIG_FILE = `ledger-signer.hjson`;
// reports
export const REPORTS_DIRECTORY = "reports";
export const REPORTS_SUCCESS_PAYMENTS_DIRECTORY = join(
  REPORTS_DIRECTORY,
  "payments",
  "success"
);
export const REPORTS_FAILED_PAYMENTS_DIRECTORY = join(
  REPORTS_DIRECTORY,
  "payments",
  "failed"
);

export const CUSTOM_DELEGATOR_REPORT_DIRECTORY = join(
  REPORTS_DIRECTORY,
  "custom",
  "delegator"
);
