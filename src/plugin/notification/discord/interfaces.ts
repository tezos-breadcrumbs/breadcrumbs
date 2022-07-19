import { NotificationPluginConfiguration } from "../interfaces";

export interface DiscordPluginConfiguration
  extends NotificationPluginConfiguration {
  webhook: string;
}
