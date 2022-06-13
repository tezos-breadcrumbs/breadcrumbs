import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "./index.ts",
  output: {
    file: "build/bc.js",
    format: "cjs",
  },
  plugins: [
    typescript({
      module: "ESNext",
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
    }),
    json(),
  ],
};
