import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // 🎯 Add the webpack configuration block to force Webpack logic
  // and handle server-side specific dependencies.
  webpack: (config, { isServer }) => {
    // This is necessary to stop Next.js/Turbopack from trying to bundle 
    // server-side logging transports (pino/thread-stream) that are not 
    // designed to run in a browser environment.
    if (isServer) {
      config.externals.push(
        'pino-transport',
        'thread-stream',
        'pino-elasticsearch',
        // Excluding 'tap' and 'desm' as they are test dependencies that Turbopack is trying to bundle
        'tap',
        'desm'
      );
    }
    
    // Ensure all test files/directories are explicitly ignored (a good practice)
    config.module.rules.push({
      test: /thread-stream\/test/,
      use: 'null-loader', // Prevents bundling of these files
    });

    return config;
  },
  
  // Remove the problematic empty experimental block
  // experimental: {}, 
  
  // Add empty turbopack config to silence the warning when using webpack
  turbopack: {},
};

export default nextConfig;