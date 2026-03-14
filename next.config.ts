/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // allow all for testing (secure later)
        // or specific: hostname: 'your-project-ref.supabase.co',
      },
    ],
    // Optional: disable optimization temporarily to debug
    // unoptimized: true,
  },
};

export default nextConfig;