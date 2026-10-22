import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    const hidden = ["/dashboard/:path*", "/admin/:path*", "/maamul-login", "/maamul-signup", "/sign-in", "/sign-up", "/google-chooser"];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" },
        ],
      },
      ...hidden.map((source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] })),
    ];
  },
  async redirects() {
    return [
      // Admin paths → real Somali routes
      { source: "/admin/login",   destination: "/maamul-login",  permanent: false },
      { source: "/admin/signup",  destination: "/maamul-signup", permanent: false },
      { source: "/admin",         destination: "/maamul-login",  permanent: false },
      // Common guesses & aliases
      { source: "/admin-login",   destination: "/maamul-login",  permanent: false },
      { source: "/admin-signup",  destination: "/maamul-signup", permanent: false },
      { source: "/maamul",        destination: "/maamul-login",  permanent: false },
    ];
  },
};

export default nextConfig;
