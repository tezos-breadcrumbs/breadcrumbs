import {
  ENotificationPluginKind,
  NotificationPlugin,
  NotificationPluginConfiguration,
} from "./interfaces";

import { name, version } from "../../../package.json";

import { TelegramPluginConfiguration } from "./telegram/interfaces";
import { DiscordPluginConfiguration } from "./discord/interfaces";
const HOST_INFO = {
  id: name,
  version,
};

export const loadNotificationPlugin = async (
  config: NotificationPluginConfiguration
): Promise<NotificationPlugin> => {
  switch (config.type) {
    case ENotificationPluginKind.Discord:
      return await (
        await import("./discord")
      ).getPlugin(config as DiscordPluginConfiguration, HOST_INFO);
    case ENotificationPluginKind.Telegram:
      return await (
        await import("./telegram")
      ).getPlugin(config as TelegramPluginConfiguration);
    default:
      try {
        return await (await import(config.type)).getPlugin(config);
      } catch {
        throw new Error(`Plugin ${config.type} not supported!`);
      }
  }
};
