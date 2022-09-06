import { NotificationPluginConfiguration } from "src/plugin/notification/interfaces";

export interface TwitterPluginConfiguration
  extends NotificationPluginConfiguration {
  api_key: string;
  api_key_secret: string;
}
