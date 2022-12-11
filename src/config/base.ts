import { BreadcrumbsConfiguration } from "./interfaces";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parse } from "hjson";
import { CONFIG_FILE, DONATIONS_FILE } from "src/utils/constants";

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

    if (existsSync(join(this.workDir, DONATIONS_FILE))) {
      this.configuration = {
        ...this.configuration,
        donations: parse(
          readFileSync(join(this.workDir, DONATIONS_FILE)).toString()
        ),
      };
    }

    return this.configuration as BreadcrumbsConfiguration;
  }
}
