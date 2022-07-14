import { Client } from "src/api-client/abstract_client";
import {
  BreadcrumbsConfiguration,
  EPayoutWalletMode,
} from "src/config/interfaces";
import { validPrivateKey } from "src/config/validate/creation";
import { schema, remoteSignerSchema } from "src/config/validate/runtime";
import { WALLET_PRIVATE_KEY_FILE } from "src/utils/constants";

export const checkValidCycle = async (client: Client, inputCycle: number) => {
  const lastCycle = await client.getLastCompletedCycle();

  if (lastCycle < inputCycle) {
    console.log(`Cannot run payments for an unfinished or future cycle`);
    process.exit(1);
  }
};

export const checkValidConfig = async (
  config: Partial<BreadcrumbsConfiguration>
) => {
  try {
    await schema.validateAsync(config);
    switch (config.payout_wallet_mode) {
      case EPayoutWalletMode.RemoteSigner: {
        const { loadRemoteSignerConfig } = await import(
          "src/tezos-client/signers/remote"
        );
        const config = await loadRemoteSignerConfig();
        remoteSignerSchema.validate(config);
        break;
      }
      case EPayoutWalletMode.LocalPrivateKey: {
        const { loadStoredPrivateKey } = await import(
          "src/tezos-client/signers/in-memory"
        );
        if (!(await validPrivateKey(await loadStoredPrivateKey()))) {
          throw new Error(`Invalid private key in ${WALLET_PRIVATE_KEY_FILE}`);
        }
        break;
      }
    }
  } catch (e) {
    console.log(`Configuration error: ${(e as Error).message}`);
    process.exit(1);
  }
};
