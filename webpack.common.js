const path = require('path');

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
                loader: 'swc-loader',
                exclude: [
                    {
                        and: [/node_modules/],
                        not: [/scroll-js/],
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
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
