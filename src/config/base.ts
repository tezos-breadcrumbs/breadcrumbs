import { BreadcrumbsConfiguration } from "./interfaces";
import { readFileSync } from "fs";
import { parse } from "hjson";

export class ConfigurationBase {
  private path: string;
  private configuration?: BreadcrumbsConfiguration;

  constructor(path: string) {
    this.path = path;
  }

  get Configuration() {
    if (this.configuration !== undefined) return this.configuration;
    this.configuration = parse(
      readFileSync(this.path).toString()
    ) as BreadcrumbsConfiguration;
    return this.configuration;
  }
}
