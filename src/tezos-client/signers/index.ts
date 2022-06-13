import { getConfig } from "src/config";
import { EPayoutWalletMode } from "src/config/interfaces";
import { getInMemorySigner } from "./in-memory";
import { getLedgerSigner } from "./ledger";

export const getSigner = async () => {
  switch (getConfig(`payout_wallet_mode`)) {
    case EPayoutWalletMode.Ledger:
      return await getLedgerSigner();
    default:
      return await getInMemorySigner();
  }
};
