/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  allowedDevOrigins: undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default config;
