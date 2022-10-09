import { WebhookClient, EmbedBuilder, HexColorString } from "discord.js";
import { omit } from "lodash";
import { capitalCase } from "change-case";

import {
  ENotificationLevel,
  NotificationInputData,
  NotificationPlugin,
  PluginHostDetails,
} from "../interfaces";
import {
  DiscordPluginConfigurationTokenAuth,
  DiscordPluginConfigurationWebhookAuth,
} from "./interfaces";

import { constructMessage } from "../helpers";

const DEFAULT_MESSAGE_TEMPLATE = "Payments for cycle <CYCLE>.";

export class DiscordClient implements NotificationPlugin {
  private hostInfo: string;
  private client: WebhookClient;
  private messageTemplate: string;

  constructor(
    config:
      | DiscordPluginConfigurationTokenAuth
      | DiscordPluginConfigurationWebhookAuth,
    host: PluginHostDetails
  ) {
    this.hostInfo = `${host.id} v${host.version}`;
    if ("webhook" in config) {
      // webhook mode
      if (!config.webhook || typeof config.webhook !== "string") {
        throw new Error(
          `Invalid discord notifier configuration. "webhook" required`
        );
      }
      this.client = new WebhookClient({ url: config.webhook });
      this.messageTemplate = config.messageTemplate ?? DEFAULT_MESSAGE_TEMPLATE;
      return;
    }
    // id + token mode
    if (!config.id || typeof config.id !== "string") {
      throw new Error(`Invalid discord notifier configuration. "id" required`);
    }
    if (!config.token || typeof config.token !== "string") {
      throw new Error(
        `Invalid discord notifier configuration. "token" required`
      );
    }
    this.client = new WebhookClient(config);
    this.messageTemplate = config.messageTemplate ?? DEFAULT_MESSAGE_TEMPLATE;
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
    level: ENotificationLevel = ENotificationLevel.Info
  ) {
    const color = this.getMessageColor(level);
    const fields = Object.keys(omit(data, ["cycle"])).map((k) => ({
      name: capitalCase(k),
      value: data[k].toString(),
    }));
    const embed = new EmbedBuilder()
      .setColor(color)
      .setFooter({ text: this.hostInfo })
      .addFields(fields)
      .setTimestamp();
    await this.client.send({
      content: constructMessage(this.messageTemplate, data),
      embeds: [embed],
    });
  }
}
