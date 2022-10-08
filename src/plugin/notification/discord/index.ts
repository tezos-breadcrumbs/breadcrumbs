import { PluginHostDetails } from "../interfaces";
import { DiscordClient } from "./client";
import {
  DiscordPluginConfigurationWebhookAuth,
  DiscordPluginConfigurationTokenAuth,
} from "./interfaces";

let cachedClient: DiscordClient | undefined = undefined;
export const getPlugin = async (
  config:
    | DiscordPluginConfigurationWebhookAuth
    | DiscordPluginConfigurationTokenAuth,
  host: PluginHostDetails
) => {
  if (cachedClient === undefined) {
    cachedClient = new DiscordClient(config, host);
  }
  return cachedClient;
};
