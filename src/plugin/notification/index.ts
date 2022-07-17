import * as Discord from "./discord";
import * as Telegram from "./telegram";

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
      return await Discord.getPlugin(config, HOST_INFO);
    case ENotificationPluginKind.Telegram:
      return await Telegram.getPlugin(config as TelegramPluginConfiguration);
    default:
      try {
        return await (await import(config.type)).getPlugin(config);
      } catch {
        throw new Error(`Plugin ${config.type} not supported!`);
      }
  }
};
