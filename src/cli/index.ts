import { OptionValues, program } from "commander";
import { pay } from "./cmd";
import { validateCycleOpt } from "./validate";

export const globalCliOptions: OptionValues = {};

export const run = async () => {
  // global options
  program
    //.enablePositionalOptions(true)
    .option("-d, --dry-run", "Prints out rewards. Won't sumbit transactions.")
    .option(
      "-w, --work-dir <workDir>",
      "Set directory breadcrumbs should operate on.",
      process.cwd()
    );

  // commands
  program
    .command("pay")
    .option("-c, --cycle <cycle>", "Cycle to pay rewards for", validateCycleOpt)
    .option(
      "--confirm",
      "Automatically sends rewards without need for confirmation."
    )
    .option(
      "--force",
      "Required to execute a payment if a payment file already exists for the give cycle"
    )
    .action(pay);

  // we need to set global options before action is executed
  program.hook("preAction", () => {
    Object.assign(globalCliOptions, program.opts());
  });
  await program.parseAsync();
};
