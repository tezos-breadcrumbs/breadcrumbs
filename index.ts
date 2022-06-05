import { run } from "src/cli";

process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error) {
    console.error(reason.message);
    return;
  }
  console.error(reason);
});

run();
