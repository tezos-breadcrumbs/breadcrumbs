import TransportWebHID from "@ledgerhq/hw-transport-node-hid";
import { LedgerSigner } from "@taquito/ledger-signer";

export const getLedgerSigner = async () => {
  const transport = await TransportWebHID.create();
  return new LedgerSigner(transport);
};
