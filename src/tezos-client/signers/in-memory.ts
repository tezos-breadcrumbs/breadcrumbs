import { InMemorySigner } from "@taquito/signer";
import { readFile } from "fs/promises";
import { join } from "path";
import { globalCliOptions } from "src/cli";
import { WALLET_PRIVATE_KEY_FILE } from "src/utils/constants";

export const getInMemorySigner = async (key?: string) => {
  if (key === undefined) {
    key = (
      await readFile(join(globalCliOptions.home, WALLET_PRIVATE_KEY_FILE))
    ).toString();
  }
  return new InMemorySigner(key);
};
