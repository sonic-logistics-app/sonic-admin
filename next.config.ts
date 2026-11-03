import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The pages moved from /driver and /vendor to /mover and /business-partner. Old links and bookmarks still work.
  async redirects() {
    return [
      { source: "/driver", destination: "/mover", permanent: false },
      { source: "/driver/:path*", destination: "/mover/:path*", permanent: false },
      { source: "/vendor", destination: "/business-partner", permanent: false },
      { source: "/vendor/:path*", destination: "/business-partner/:path*", permanent: false },
    ];
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "spaces.digitalocean.com",
      },
    ],
  },
};

export default nextConfig;
