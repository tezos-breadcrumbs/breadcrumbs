import {
  ENotificationPluginKind,
  NotificationPlugin,
  NotificationPluginConfiguration,
} from "./interfaces";
import { name, version } from "../../../package.json";
import { TelegramPluginConfiguration } from "./telegram/interfaces";
const HOST_INFO = {
  id: name,
  version,
};

export const loadNotificationPlugin = async (
  config: NotificationPluginConfiguration
): Promise<NotificationPlugin> => {
  switch (config.type) {
    case ENotificationPluginKind.Discord:
      return (await import("./discord")).getPlugin(config, HOST_INFO);
    case ENotificationPluginKind.Telegram:
      return await (
        await import("./telegram")
      ).getPlugin(config as TelegramPluginConfiguration);
    default:
      throw new Error(`Plugin ${config.type} not supported!`);
  }
};
