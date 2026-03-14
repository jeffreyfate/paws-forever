/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/signed-url',
        // omit 'search' to allow any query params (?path=..., ?other=...)
      },
    ],
  },
};

export default nextConfig;