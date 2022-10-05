import { TwitterClient } from "./client";
import { TwitterPluginConfiguration } from "./interfaces";

export const getPlugin = async (config: TwitterPluginConfiguration) => {
  return new TwitterClient(config);
};
