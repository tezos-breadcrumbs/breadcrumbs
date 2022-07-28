import TransportWebHID from "@ledgerhq/hw-transport-node-hid";
import { LedgerSigner } from "@taquito/ledger-signer";
import { readFile } from "fs/promises";
import { LEDGER_SIGNER_CONFIG_FILE } from "src/utils/constants";
import { parse } from "hjson";
import { get } from "lodash";

export const loadLedgerSignerConfig = async () => {
  const config = {
    derivation_path: `44'/1729'/0'/0'`,
    /*
      ED25519 = 0,
      SECP256K1 = 1,
      P256 = 2
     */
    derivation_type: 0,
  };
  try {
    Object.assign(
      config,
      parse((await readFile(LEDGER_SIGNER_CONFIG_FILE)).toString())
    );
  } catch (err) {
    if (get(err, "code") !== "ENOENT") {
      console.log(
        `Failed to load ledger configuration from ${LEDGER_SIGNER_CONFIG_FILE} - ${get(
          err,
          "message",
          err
        )}`
      );
    }
  }
  return config;
};

export const getLedgerSigner = async () => {
  console.log(`Please confirm public key export on your ledger:`);
  const config = await loadLedgerSignerConfig();
  const transport = await TransportWebHID.create();
  const ledgerSigner = new LedgerSigner(
    transport,
    config.derivation_path,
    undefined,
    config.derivation_type
  );
  await ledgerSigner.publicKey();
  console.log(`Ledger connected.`);
  return ledgerSigner;
};
