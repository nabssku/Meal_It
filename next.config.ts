import type { NextConfig } from "next";
const hasSingleQuote = __dirname.includes("'");
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development" || hasSingleQuote,
});

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@neondatabase/serverless",
    "@prisma/adapter-neon",
    "groq-sdk",
  ],
};

export default withPWA(nextConfig);
