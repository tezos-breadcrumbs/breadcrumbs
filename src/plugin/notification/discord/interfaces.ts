import { NotificationPluginConfiguration } from "../interfaces";

export interface DiscordPluginConfigurationWebhookAuth
  extends NotificationPluginConfiguration {
  webhook: string;
}

export interface DiscordPluginConfigurationTokenAuth
  extends NotificationPluginConfiguration {
  id: string;
  token: string;
}
