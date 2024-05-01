/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['pino'],
  },
  runtime: 'nodejs',
  env: {
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    GRAPHQL_URL_WS: process.env.GRAPHQL_URL_WS,
  },
};

module.exports = nextConfig;
