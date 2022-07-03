import { InMemorySigner } from "@taquito/signer";
import { readFile } from "fs/promises";
import { join } from "path";
import { globalCliOptions } from "src/cli";
import { WALLET_PRIVATE_KEY_FILE } from "src/utils/constants";

export const loadStoredPrivateKey = async () => {
  return (
    await readFile(join(globalCliOptions.workDir, WALLET_PRIVATE_KEY_FILE))
  ).toString();
};

export const getInMemorySigner = async (key?: string) => {
  if (key === undefined) {
    key = await loadStoredPrivateKey();
  }
  return new InMemorySigner(key);
};
