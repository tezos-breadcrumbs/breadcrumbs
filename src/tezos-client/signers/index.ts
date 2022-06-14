import { getConfig } from "src/config";
import {
  BreadcrumbsConfiguration,
  EPayoutWalletMode,
} from "src/config/interfaces";

export const getSigner = async (config: BreadcrumbsConfiguration) => {
  switch (config.payout_wallet_mode) {
    case EPayoutWalletMode.Ledger: {
      const { getLedgerSigner } = await import("./ledger");
      return await getLedgerSigner();
    }
    default: {
      const { getInMemorySigner } = await import("./in-memory");
      return await getInMemorySigner();
    }
  }
};
