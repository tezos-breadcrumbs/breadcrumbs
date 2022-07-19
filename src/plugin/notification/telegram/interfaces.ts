import { NotificationPluginConfiguration } from "src/plugin/notification/interfaces";

export interface TelegramPluginConfiguration
  extends NotificationPluginConfiguration {
  api_token: string;
  chat_id: number;
}
