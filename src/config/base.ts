import { BreadcrumbsConfiguration } from "./interfaces";
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "hjson";
import { CONFIG_FILE } from "src/utils/constants";

export class ConfigurationBase {
  private workDir: string;
  private configuration?: BreadcrumbsConfiguration;

  constructor(workDir: string) {
    this.workDir = workDir;
  }

  get Configuration() {
    if (this.configuration !== undefined) return this.configuration;
    this.configuration = parse(
      readFileSync(join(this.workDir, CONFIG_FILE)).toString()
    ) as BreadcrumbsConfiguration;
    return this.configuration;
  }
}
