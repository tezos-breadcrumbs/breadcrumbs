import { globalCliOptions } from "src/cli/global";
import { ConfigurationBase } from "./base";
import { BreadcrumbsConfiguration } from "./interfaces";

let configurationBase: ConfigurationBase | undefined;
export function getConfig(): BreadcrumbsConfiguration;
export function getConfig<K extends keyof BreadcrumbsConfiguration>(
  key: K
): BreadcrumbsConfiguration[K];
export function getConfig<K extends keyof BreadcrumbsConfiguration>(
  key?: K
): BreadcrumbsConfiguration | BreadcrumbsConfiguration[K] {
  if (configurationBase === undefined) {
    configurationBase = new ConfigurationBase(globalCliOptions.workDir);
    console.log(`Configuration:`, configurationBase.Configuration);
  }
  if (key !== undefined) {
    return configurationBase.Configuration[key];
  }
  return configurationBase.Configuration;
}
