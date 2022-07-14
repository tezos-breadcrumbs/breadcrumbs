import {
  NotificationPluginConfiguration,
  PluginHostDetails,
} from "../interfaces";
import { DiscordClient } from "./client";

let cachedClient: DiscordClient | undefined = undefined;
export const get_plugin = async (
  config: NotificationPluginConfiguration,
  host: PluginHostDetails
) => {
  if (cachedClient === undefined) {
    cachedClient = new DiscordClient(config, host);
  }
  return cachedClient;
};
