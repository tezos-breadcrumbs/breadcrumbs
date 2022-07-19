import TelegramBot from "node-telegram-bot-api";
import {
  NotificationPlugin,
  NotificationInputData,
} from "src/plugin/notification/interfaces";
import { constructMessage } from "../helpers";

import { TelegramPluginConfiguration } from "./interfaces";

export class TelegramClient implements NotificationPlugin {
  private client: TelegramBot;
  private chatId: number;

  constructor(config: TelegramPluginConfiguration) {
    this.chatId = config.chat_id;
    this.client = new TelegramBot(config.api_token);
  }

  public async notify(
    data: NotificationInputData,
    messageTemplate: string = `A total of <T_REWARDS> tez was distributed for cycle <CYCLE>.`
  ) {
    await this.client.sendMessage(
      this.chatId,
      constructMessage(messageTemplate, data)
    );
  }
}
