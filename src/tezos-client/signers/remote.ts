import { RemoteSigner } from "@taquito/remote-signer";
import { readFile } from "fs/promises";
import { REMOTE_SIGNER_CONFIG_FILE } from "src/utils/constants";
import { parse } from "hjson";

export const loadRemoteSignerConfig = async () => {
  return parse((await readFile(REMOTE_SIGNER_CONFIG_FILE)).toString());
};

export const getRemoteSigner = async () => {
  const remoteSignerConfig = await loadRemoteSignerConfig();
  return new RemoteSigner(
    remoteSignerConfig.public_key,
    remoteSignerConfig.url
  );
};
