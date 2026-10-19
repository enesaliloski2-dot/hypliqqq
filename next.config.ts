import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // wagmi/walletconnect pull optional node deps; keep the browser bundle clean
  webpack: (config) => { config.externals.push("pino-pretty", "lokijs", "encoding"); return config; },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Frame-Options", value: "DENY" }, { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ]}];
  },
};
export default nextConfig;
