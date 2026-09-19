/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: [
      "stream-chat-react",
      "stream-chat",
      "lucide-react",
    ],
    staleTimes: {
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  webpack: (config, { isServer }) => {
    // web-push (used server-side for push notifications) pulls in
    // https-proxy-agent, which references Node core modules that don't
    // exist in the browser. That code is never reached from client-side
    // execution, but if a server-only module ever gets transitively
    // imported into a client bundle by mistake, this stops webpack from
    // hard-failing the build over it -- it just stubs those modules out
    // for the client bundle instead of erroring.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        child_process: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
};

export default nextConfig;
