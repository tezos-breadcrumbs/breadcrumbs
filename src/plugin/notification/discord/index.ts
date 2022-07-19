import { PluginHostDetails } from "../interfaces";
import { DiscordClient } from "./client";
import { DiscordPluginConfiguration } from "./interfaces";

let cachedClient: DiscordClient | undefined = undefined;
export const getPlugin = async (
  config: DiscordPluginConfiguration,
  host: PluginHostDetails
) => {
  if (cachedClient === undefined) {
    cachedClient = new DiscordClient(config, host);
  }
  return cachedClient;
};
