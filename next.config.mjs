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
      {
        protocol: "https",
        hostname: "cdn.marble.worldlabs.ai",
      },
    ],
  },
};

export default nextConfig;
