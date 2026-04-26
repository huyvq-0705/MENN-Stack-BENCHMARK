/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Tiện thể bỏ qua lỗi TypeScript nếu có
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
