import { ConfigurationBase } from "./base";
import { BreadcrumbsConfiguration } from "./interfaces";

const configurationBase = new ConfigurationBase();

export function get_config(): BreadcrumbsConfiguration;
export function get_config<K extends keyof BreadcrumbsConfiguration>(
  key: K
): BreadcrumbsConfiguration[K];
export function get_config<K extends keyof BreadcrumbsConfiguration>(
  key?: K
): BreadcrumbsConfiguration | BreadcrumbsConfiguration[K] {
  if (key !== undefined) {
    return configurationBase.Configuration[key];
  }
  return configurationBase.Configuration;
}
