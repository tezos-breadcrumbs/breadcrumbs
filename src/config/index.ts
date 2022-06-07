import { ConfigurationBase } from "./base";
import { BreadcrumbsConfiguration } from "./interfaces";

const configurationBase = new ConfigurationBase();

export function getConfig(): BreadcrumbsConfiguration;
export function getConfig<K extends keyof BreadcrumbsConfiguration>(
  key: K
): BreadcrumbsConfiguration[K];
export function getConfig<K extends keyof BreadcrumbsConfiguration>(
  key?: K
): BreadcrumbsConfiguration | BreadcrumbsConfiguration[K] {
  if (key !== undefined) {
    return configurationBase.Configuration[key];
  }
  return configurationBase.Configuration;
}
