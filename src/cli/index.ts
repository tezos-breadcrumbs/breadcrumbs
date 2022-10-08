import { program } from "commander";
import { configure, pay, version, notificationTest } from "./cmd";
import { generateDelegatorReport } from "./cmd/generate-delegator-report";
import { globalCliOptions } from "./global";
import {
  validateCycleOpt,
  validAddress,
  validateNotificationType,
} from "./validate";

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
    .action(pay);

  program.command("version").action(version);
  program.command("configure").action(configure);
  program
    .command("notification-test")
    .option(
      "-p, --plugin-type <type>",
      "Type of plugins to test",
      validateNotificationType
    )
    .action(notificationTest);

  program
    .command("generateDelegatorReport")
    .requiredOption("-s, --startCycle <cycle>", "", validateCycleOpt)
    .requiredOption("-e, --endCycle <cycle>", "", validateCycleOpt)
    .requiredOption("-e, --delegator <delegator>", "", validAddress)

    .action(generateDelegatorReport);

  // we need to set global options before action is executed
  program.hook("preAction", () => {
    Object.assign(globalCliOptions, program.opts());
  });
  await program.parseAsync();
};
