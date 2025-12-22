/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.wgsl$/,
            type: 'asset/source',
        });
        return config;
    },
    turbopack: {
        rules: {
            '*.wgsl': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
        },
    },
}

module.exports = nextConfig
