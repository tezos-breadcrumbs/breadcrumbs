import { BreadcrumbsConfiguration } from "./interfaces";
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "hjson";
import { CONFIG_FILE } from "src/utils/constants";

export class ConfigurationBase {
  private homeDir: string;
  private configuration?: BreadcrumbsConfiguration;

  constructor(home: string) {
    this.homeDir = home;
  }

  get Configuration() {
    if (this.configuration !== undefined) return this.configuration;
    this.configuration = parse(
      readFileSync(join(this.homeDir, CONFIG_FILE)).toString()
    ) as BreadcrumbsConfiguration;
    return this.configuration;
  }
}
