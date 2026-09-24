import type { NextConfig } from "next";

// Images only from the card databases and Google avatars, so a player-set image
// URL cannot track who is viewing the table. No framing, to stop clickjacking.
const contentSecurityPolicy = [
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https://cards.scryfall.io https://cdn.swu-db.com https://*.googleusercontent.com",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
