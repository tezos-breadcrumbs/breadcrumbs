import { getConfig } from "src/config";
import { EPayoutWalletMode } from "src/config/interfaces";

export const getSigner = async () => {
  switch (getConfig(`payout_wallet_mode`)) {
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
