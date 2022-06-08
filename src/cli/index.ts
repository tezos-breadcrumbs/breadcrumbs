import { OptionValues, program } from "commander";
import { pay } from "./cmd";
import { validateCycleOpt } from "./validate";

export let cliOptions: OptionValues = {};

export const run = async () => {
  // global options
  program
    //.enablePositionalOptions(true)
    .option("--config <config>", "Path to configuration file", "./config.hjson")
    .option("-d, --dry-run", "Prints out rewards. Won't sumbit transactions.");

  // commands
  program
    .command("pay")
    .option("-c, --cycle <cycle>", "Cycle to pay rewards for", validateCycleOpt)
    .action(pay);

  // we need to set global options before action is executed
  program.hook("preAction", () => {
    cliOptions = program.opts();
  });
  await program.parseAsync();
};

export const getCliOption = (opt: keyof OptionValues) => {
  return cliOptions[opt];
};
