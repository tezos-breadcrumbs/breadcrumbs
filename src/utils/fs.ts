import { mkdir, stat } from "fs/promises";

export const ensureDirectoryExists = async (path: string) => {
  try {
    const st = await stat(path);
    if (!st.isDirectory) {
      throw new Error(`${path} is not a directory!`);
    }
  } catch {
    await mkdir(path, { recursive: true });
  }
};
