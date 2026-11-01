import type { NextConfig } from "next";

/** Static, clickable mock for GitHub Pages — no server, sample data only. */
export const BASE_PATH = "/pickleball-central-mock";

const config: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
};

export default config;
