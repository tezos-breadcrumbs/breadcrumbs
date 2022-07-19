import { copy, existsSync } from "fs-extra";
import { execSync } from "child_process";

const targets = [
  { platform: "x64", os: "linux" },
  { platform: "x64", os: "win" },
  { platform: "arm64", os: "linux" },
];

(async () => {
  for (const target of targets) {
    console.log(`Prepare dependencies for ${target.os}-${target.platform}`);
    await copy(`build/hid/${target.platform}/`, "build/Release/", {
      recursive: true,
    });
    await copy(
      `build/hid/${target.platform}/`,
      "node_modules/node-hid/build/Release/",
      { recursive: true }
    );
    await copy(
      `build/hid/${target.platform}/HID.node.${target.os}`,
      "node_modules/node-hid/build/Release/HID.node"
    );
    if (existsSync(`build/hid/${target.platform}/HID_hidraw.node.${target.os}`))
      await copy(
        `build/hid/${target.platform}/HID_hidraw.node.${target.os}`,
        "node_modules/node-hid/build/Release/HID_hidraw.node"
      );
    console.log(`Compile ${target.os}-${target.platform}...`);

    execSync(
      `npm run pkg-internal -- -t node16-${target.os}-${target.platform} --output bin/bc-${target.os}-${target.platform} --no-bytecode --public-packages "*" --public -C Brotli -c build/pkg.config.json bin/index.js`
    );
    console.log(`${target.os}-${target.platform} compiled.`);
  }
})();
