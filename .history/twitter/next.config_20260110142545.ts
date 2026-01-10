import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  // Remove 'eslint' from here entirely
};

export default nextConfig;
