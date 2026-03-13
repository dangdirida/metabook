/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "image.yes24.com",
      },
      {
        protocol: "https",
        hostname: "www.gimmyoung.com",
      },
    ],
  },
};

export default nextConfig;
