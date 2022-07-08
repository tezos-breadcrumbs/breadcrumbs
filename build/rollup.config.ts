import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import injectProcessEnv from "rollup-plugin-inject-process-env";

export default {
  input: "./index.ts",
  output: {
    dir: "bin/",
    format: "cjs",
    inlineDynamicImports: true,
  },
  preserveEntrySignatures: true,
  plugins: [
    typescript({
      module: "esnext",
      moduleResolution: "node",
      compilerOptions: {
        paths: {
          "csv-writer": ["node_modules/csv-writer/dist/index.js"], // point csv writer to bundled version
        },
      },
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs({
      include: /node_modules/,
      ignoreDynamicRequires: true,
    }),
    json(),
    injectProcessEnv({
      BREADCRUMBS_PREBUILD: process.env.BREADCRUMBS_PREBUILD,
    }),
  ],
};
