/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  redirects: async () => require('./vercel.json').redirects ?? [],
  rewrites: async () => require('./vercel.json').rewrites ?? [],
  experimental: {
    serverComponentsExternalPackages: ['@microsoft/api-extractor-model', 'jju'],
  },
  poweredByHeader: false,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};
