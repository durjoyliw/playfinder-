/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type-checking and linting run on every build (they were disabled while
  // ~120 type errors existed; the codebase is now clean, so keep it that way).
  experimental: {
    // Enables unstable_after() (src/lib/after-response.ts): notification
    // pushes run after the response, once transactions have committed.
    after: true,
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
  // Baseline security headers on every response. (No full CSP yet: Mapbox,
  // Stream and UploadThing need a careful allow-list; frame-ancestors alone
  // is safe and stops clickjacking.)
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(), geolocation=(self), payment=()",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ],
    },
  ],
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
