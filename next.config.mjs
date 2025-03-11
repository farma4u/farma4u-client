/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.farma4u.com.br',
        port: '',
        pathname: '/api/images/**',
      },
    ],
  },
};

export default nextConfig;
