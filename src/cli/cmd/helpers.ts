import { Client } from "src/api-client/abstract_client";
import { schema } from "src/config/validate/runtime";

export const checkValidCycle = async (client: Client, inputCycle: number) => {
  const lastCycle = await client.getLastCycle();

  if (lastCycle < inputCycle) {
    console.log(`Cannot run payments for an unfinished or future cycle`);
    process.exit(1);
  }
};

export const checkValidConfig = async (config) => {
  try {
    await schema.validateAsync(config);
  } catch (e) {
    console.log(`Configuration error: ${(e as Error).message}`);
    process.exit(1);
  }
};
