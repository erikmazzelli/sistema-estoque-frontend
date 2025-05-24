/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_DOMAIN: process.env.API_DOMAIN,
    API_PORT: process.env.API_PORT,
  },
};

export default nextConfig;
