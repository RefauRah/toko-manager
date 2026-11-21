/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['knex', 'better-sqlite3', 'pg', 'bcryptjs']
  }
};

export default nextConfig;
