/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    GRAPHQL_URL: process.env.GRAPHQL_URL,
  },
};

module.exports = nextConfig;
