/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Required for Cloudflare
  experimental: {
    // Required to handle cookies in a serverless environment
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // For handling dynamic routes correctly
  reactStrictMode: true,
};

module.exports = nextConfig;
