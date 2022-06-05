import { BreadcrumbsConfiguration } from "./interfaces";
import { program } from "commander";
import { readFileSync } from "fs";
import { parse } from "hjson";

export class ConfigurationBase {
  private configuration?: BreadcrumbsConfiguration;

  get Configuration() {
    if (this.configuration !== undefined) return this.configuration;
    const configPath = program.opts().config;
    this.configuration = parse(
      readFileSync(configPath).toString()
    ) as BreadcrumbsConfiguration;
    return this.configuration;
  }
}
