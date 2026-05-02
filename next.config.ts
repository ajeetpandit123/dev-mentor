import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qlkrdipyrqikvafhmeio.supabase.co',
        port: '',
        pathname: '/**',
      }
    ],
  },

  // 🔥 ADD THIS (VERY IMPORTANT)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;