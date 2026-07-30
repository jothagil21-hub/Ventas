import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  images: {
    localPatterns: [
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
