import { setupPolly } from "setup-polly-jest";

export const start = () => {
  setupPolly({
    mode: "replay",
    adapters: [require("@pollyjs/adapter-node-http")],
    persister: require("@pollyjs/persister-fs"),
    persisterOptions: {
      fs: { recordingsDir: "test/__recordings__" },
    },
    expiresIn: "30d",
    expiryStrategy: "warn",
    matchRequestsBy: {
      method: true,
      headers: false,
      body: true,
      order: false,
      url: {
        protocol: false,
        username: false,
        password: false,
        hostname: true,
        port: false,
        pathname: true,
        query: true,
      },
    },
  });
};
