// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/chat',
        destination: '/Chat',
        permanent: true,
      },
    ];
  },
  images: {
    domains: ['10.13.7.8', 'localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '10.13.7.8',
        port: '8000',
        pathname: '**',
      }
    ]
  }
};

module.exports = nextConfig;