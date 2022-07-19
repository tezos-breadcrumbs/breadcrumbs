import { WebhookClient, MessageEmbed, HexColorString } from "discord.js";
import { omit } from "lodash";
import { capitalCase } from "change-case";

import {
  ENotificationLevel,
  NotificationInputData,
  NotificationPlugin,
  NotificationPluginConfiguration,
  PluginHostDetails,
} from "../interfaces";
import { DiscordPluginConfiguration } from "./interfaces";

import { constructMessage } from "../helpers";

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
    data: NotificationInputData,
    messageTemplate: string = `Payments for cycle <CYCLE>.`,
    level: ENotificationLevel = ENotificationLevel.Info
  ) {
    const color = this.getMessageColor(level);
    const fields = Object.keys(omit(data, ["cycle"])).map((k) => ({
      name: capitalCase(k),
      value: data[k].toString(),
    }));
    const embed = new MessageEmbed()
      .setColor(color)
      .setFooter({ text: this.hostInfo })
      .addFields(fields)
      .setTimestamp();
    await this.client.send({
      content: constructMessage(messageTemplate, data),
      embeds: [embed],
    });
  }
}
