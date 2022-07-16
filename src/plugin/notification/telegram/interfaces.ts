import { NotificationPluginConfiguration } from "src/plugin/notification/interfaces";

export interface TelegramPluginConfiguration
  extends NotificationPluginConfiguration {
  apiToken: string;
  chatId: number;
}
