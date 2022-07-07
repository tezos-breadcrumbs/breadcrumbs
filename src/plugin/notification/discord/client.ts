import { WebhookClient, MessageEmbed, HexColorString } from "discord.js";
import {
  ENotificationLevel,
  NotificationPlugin,
  NotificationPluginConfiguration,
  PluginHostDetails,
} from "../interfaces";
import { DiscordPluginConfiguration } from "./interfaces";

export class DiscordClient implements NotificationPlugin {
  private hostInfo: string;
  private client: WebhookClient;
  constructor(
    config: NotificationPluginConfiguration &
      Partial<DiscordPluginConfiguration>,
    host: PluginHostDetails
  ) {
    this.hostInfo = `${host.id} v${host.version}`;
    if (!config.webhook) {
      throw new Error(
        `Invalid discord notifier configuration. "webhook" requried`
      );
    }
    this.client = new WebhookClient({ url: config.webhook });
  }

  private getMessageColor(level: ENotificationLevel): HexColorString {
    switch (level) {
      case ENotificationLevel.Info:
        return "#03fc77";
      case ENotificationLevel.Warning:
        return "#d2541e";
      case ENotificationLevel.Error:
        return "#D21E2B";
      default:
        return "#1eabd2";
    }
  }

  public async notify(
    message: string,
    data: { [key: string]: string } = {},
    level: ENotificationLevel = ENotificationLevel.Info
  ) {
    const color = this.getMessageColor(level);
    const fields = Object.keys(data).map((k) => ({
      name: k,
      value: data[k].toString(),
    }));
    console.log(data, fields);
    const embed = new MessageEmbed()
      .setColor(color)
      .setFooter({ text: this.hostInfo })
      .addFields(fields)
      .setTimestamp();
    await this.client.send({ content: message, embeds: [embed] });
  }
}
