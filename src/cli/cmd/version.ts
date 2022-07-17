import { version as bcVersion } from "../../../package.json";

export const version = async () => {
  console.log(bcVersion);
};
