import { join } from "path";
import { parse } from "hjson";
import { readFileSync } from "fs";

import { globalCliOptions } from "src/cli/global";
import { runConfigurator } from "src/config/configure";

import { DONATIONS_FILE } from "src/utils/constants";

export const configure = async () => {
  const donationsFile = globalCliOptions.donationsFile ?? DONATIONS_FILE;
  const donationsConfig = parse(
    readFileSync(join(globalCliOptions.workDir, donationsFile)).toString()
  );
  await runConfigurator(donationsConfig);
};
