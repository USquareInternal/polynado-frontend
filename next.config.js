/** @type {import('next').NextConfig} */
const { IgnorePlugin } = require('webpack');

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fixed: Updated regex pattern to match files with extensions
      // Matches: test, bench, README, LICENSE files with any extension or no extension
      config.plugins.push(
        new IgnorePlugin({
          resourceRegExp: /thread-stream\/(?:test|bench|README|LICENSE)(?:\.[^/]*)?$/,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;

