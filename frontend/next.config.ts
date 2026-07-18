import type { NextConfig } from "next";

function parseRemotePattern(url: string | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const apiPattern = parseRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: apiPattern ? [apiPattern] : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
