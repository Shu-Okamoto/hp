/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/wireframes", destination: "/wireframes/index.html" },
    ];
  },
};

export default nextConfig;
