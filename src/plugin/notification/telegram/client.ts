import TelegramBot from "node-telegram-bot-api";
import {
  NotificationPlugin,
  NotificationPluginConfiguration,
} from "src/plugin/notification/interfaces";

import { TelegramPluginConfiguration } from "./interfaces";

export class TelegramClient implements NotificationPlugin {
  private client: TelegramBot;
  private chatId: number;

  constructor(config: TelegramPluginConfiguration) {
    this.chatId = config.chatId;
    this.client = new TelegramBot(config.apiToken);
  }

  public async notify(message: string) {
    await this.client.sendMessage(this.chatId, message);
  }
}
