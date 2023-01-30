/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true
    }
    return config
  }
}
