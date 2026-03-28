import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  } as any,
};

export default nextConfig;
