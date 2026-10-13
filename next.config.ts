/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  trailingSlash: true,
  output: 'export',
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  
  basePath: '', // Keep empty if you don’t want to change root path
};

export default nextConfig;