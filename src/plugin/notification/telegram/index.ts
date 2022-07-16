import { TelegramClient } from "./client";
import { TelegramPluginConfiguration } from "./interfaces";

export const getPlugin = async (config: TelegramPluginConfiguration) => {
  return new TelegramClient(config);
};
