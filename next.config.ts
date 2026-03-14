/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow query strings on your local API routes
    localPatterns: [
      {
        pathname: '/api/signed-url',
        search: 'path=*',  // explicit wildcard for ?path=...
      },
    ],

    // If you haven't already (for Supabase external signed URLs)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',                     // or specifically 'your-project.supabase.co'
      },
    ],
  },
};

export default nextConfig;