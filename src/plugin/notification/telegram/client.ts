process.env["NTBA_FIX_319"] = "1";

import TelegramBot from "node-telegram-bot-api";
import {
  NotificationPlugin,
  NotificationInputData,
} from "src/plugin/notification/interfaces";
import { constructMessage } from "../helpers";

import { TelegramPluginConfiguration } from "./interfaces";

const DEFAULT_MESSAGE_TEMPLATE =
  "A total of <T_REWARDS> tez was distributed for cycle <CYCLE>.";

export class TelegramClient implements NotificationPlugin {
  private client: TelegramBot;
  private chatId: number;
  private messageTemplate: string;

  constructor(config: TelegramPluginConfiguration) {
    this.chatId = config.chat_id;
    this.client = new TelegramBot(config.api_token);
    this.messageTemplate = config.messageTemplate ?? DEFAULT_MESSAGE_TEMPLATE;
  }

  public async notify(data: NotificationInputData) {
    await this.client.sendMessage(
      this.chatId,
      constructMessage(this.messageTemplate, data)
    );
  }
}
