/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disable React strict mode

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // compiler: {
    //     styledComponents: true,
    //     ignoreBuildErrors: true,
    //   },
    //   experimental: {
    //     // This will ignore HTML validation warnings
    //     strictNextHead: false,
    //   }
    
};

export default nextConfig;
