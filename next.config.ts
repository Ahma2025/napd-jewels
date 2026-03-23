import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 🔥 هذا السطر الجديد
    remotePatterns: [
      {
        protocol: "https",
        hostname: "otkgofsblfouiauwqlbj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;