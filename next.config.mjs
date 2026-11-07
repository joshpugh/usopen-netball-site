/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep every old usopennetball.com URL working after the domain moves to Vercel.
  async redirects() {
    return [
      { source: "/event", destination: "/#event", permanent: true },
      { source: "/book-hotel", destination: "/#stay", permanent: true },
      { source: "/sponsors", destination: "/#partners", permanent: true },
      { source: "/get-involved", destination: "/#get-involved", permanent: true },
      { source: "/media", destination: "/#media", permanent: true },
      { source: "/2025-results", destination: "/results", permanent: true },
      { source: "/mixed-results", destination: "/results#2024", permanent: true },
      { source: "/results-1", destination: "/results#replays", permanent: true },
    ];
  },
};
export default nextConfig;
