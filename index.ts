import { run } from "src/cli";

process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error) {
    console.error(reason.message);
    process.exit(1);
  }
  console.error(reason);
  process.exit(1);
});

run();
