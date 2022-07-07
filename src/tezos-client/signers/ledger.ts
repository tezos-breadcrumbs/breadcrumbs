import TransportWebHID from "@ledgerhq/hw-transport-node-hid";
import { LedgerSigner } from "@taquito/ledger-signer";

export const getLedgerSigner = async () => {
  console.log(`Please confirm public key export on your ledger:`);
  const transport = await TransportWebHID.create();
  const ledgerSigner = new LedgerSigner(transport);
  await ledgerSigner.publicKey();
  console.log(`Ledger connected.`);
  return ledgerSigner;
};
