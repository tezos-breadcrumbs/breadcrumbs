import { OptionValues, program } from "commander";
import { pay } from "./cmd";
import { validateCycleArg } from "./validate";

export let cliOptions: OptionValues = {};

export const run = async () => {
  // global options
  program
    .option("--config <config>", "Path to configuration file", "./config.hjson")
    .option("-d, --dry-run", "Prints out rewards. Won't sumbit transactions.");

  // commands
  program
    .command("pay")
    .argument("<cycle>", "Cycle to pay rewards for", validateCycleArg)
    .action(pay);

  // we need to set global options before action is executed
  program.hook("preAction", () => {
    cliOptions = program.opts();
  });
  await program.parseAsync();
};

export const get_cli_option = (opt: keyof OptionValues) => {
  return cliOptions[opt];
};
