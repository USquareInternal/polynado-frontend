import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true, // Keep this if you need it
  
  // Acknowledge the webpack config to avoid console warnings when using 'next build'
  // (though the --webpack flag in package.json is the main fix).
  turbopack: {},
  
  webpack: (config, { isServer, webpack }) => {
    
    // ============ Recommended Fix: IgnorePlugin (Targeting the Root Cause) ============
    if (isServer) {
        // Explicitly ignore files and directories inside node_modules/thread-stream/
        // that are causing errors (tests, benchmarks, docs, license).
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /thread-stream\/(?:test|bench|README|LICENSE)/,
                contextRegExp: /node_modules/,
            })
        );
    }
    
    // ============ Optional: Externalizing Server-Only Modules ============
    if (isServer) {
      // This helps prevent bundling of native Node.js libraries
      config.externals.push(
        'pino-transport',
        'thread-stream',
        'pino-elasticsearch',
        // Externalize test-only dependencies that are causing module-not-found errors
        'tap',
        'desm',
        'fastbench' 
      );
    }

    return config;
  },
};

export default nextConfig;