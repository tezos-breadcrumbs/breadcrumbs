import { TwitterApi, TwitterApiTokens } from "twitter-api-v2";
import {
  NotificationPlugin,
  NotificationInputData,
} from "src/plugin/notification/interfaces";
import { constructMessage } from "../helpers";

import { TwitterPluginConfiguration } from "./interfaces";

const DEFAULT_MESSAGE_TEMPLATE =
  "A total of <T_REWARDS> tez was distributed for cycle <CYCLE>.";

export class TwitterClient implements NotificationPlugin {
  private client: TwitterApi;
  private messageTemplate: string;

  constructor(config: TwitterPluginConfiguration) {
    this.client = new TwitterApi({
      appKey: config.api_key,
      appSecret: config.api_key_secret,
      accessToken: config.access_token,
      accessSecret: config.access_token_secret,
    } as TwitterApiTokens);
    this.messageTemplate = config.messageTemplate ?? DEFAULT_MESSAGE_TEMPLATE;
  }

  public async notify(data: NotificationInputData) {
    try {
      await this.client.v2.tweet(constructMessage(this.messageTemplate, data));
    } catch (err) {
      console.log(err);
    }
  }
}
