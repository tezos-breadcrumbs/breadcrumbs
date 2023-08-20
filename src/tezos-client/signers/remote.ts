import { RemoteSigner } from "@taquito/remote-signer";
import { readFile } from "fs/promises";
import { join } from "path";
import { REMOTE_SIGNER_CONFIG_FILE } from "src/utils/constants";
import { globalCliOptions } from "src/cli/global";
import { parse } from "hjson";

export const loadRemoteSignerConfig = async () => {
  return parse(
    (
      await readFile(join(globalCliOptions.workDir, REMOTE_SIGNER_CONFIG_FILE))
    ).toString()
  );
};

export const getRemoteSigner = async () => {
  const remoteSignerConfig = await loadRemoteSignerConfig();
  return new RemoteSigner(
    remoteSignerConfig.public_key,
    remoteSignerConfig.url
  );
};
