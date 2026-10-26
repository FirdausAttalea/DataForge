import type { NextConfig } from "next";

// The API runs on a separate port in development. Proxying /api through the
// frontend makes the browser treat API calls as same-origin, so the HttpOnly
// session cookie is sent and stored normally.
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;