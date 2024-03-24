const path = require('node:path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: ['./src/index.tsx'],
    output: {
        filename: 'pka-index-frontend.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/i,
                exclude: [
                    {
                        and: [/node_modules/],
                        not: [/scroll-js/],
                    },
                ],
                loader: 'swc-loader',
                options: {
                    jsc: {
                        transform: {
                            react: {
                                development: isDevelopment,
                                refresh: isDevelopment,
                            },
                        },
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.woff$/i,
                type: 'asset/resource',
            },
            {
                test: /\.wasm$/i,
                type: 'asset/inline',
            },
        ],
    },
    resolve: {
        alias: {
            LibWasm: path.resolve(__dirname, 'src/lib_wasm'),
        },
        extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
    },
    experiments: {
        asyncWebAssembly: true,
        topLevelAwait: true,
    },
};
