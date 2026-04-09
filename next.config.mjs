/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "image.yes24.com" },
      { protocol: "https", hostname: "www.gimmyoung.com" },
      { protocol: "https", hostname: "cdn.marble.worldlabs.ai" },
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "fal.run" },
      { protocol: "https", hostname: "v3.fal.media" },
      { protocol: "https", hostname: "cdn.apiframe.pro" },
      { protocol: "https", hostname: "musicfile.kie.ai" },
    ],
  },
};

export default nextConfig;
