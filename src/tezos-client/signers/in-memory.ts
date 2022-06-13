import { InMemorySigner } from "@taquito/signer";
import { readFile } from "fs/promises";
import { WALLET_PRIVATE_KEY_FILE } from "src/utils/constants";

export const getInMemorySigner = async (key?: string) => {
  if (key === undefined) {
    key =
      process.env.PAYOUT_PRIVATE_KEY ??
      (await readFile(WALLET_PRIVATE_KEY_FILE)).toString();
  }
  return new InMemorySigner(key);
};
