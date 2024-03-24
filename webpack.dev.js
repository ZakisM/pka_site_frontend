const common = require('./webpack.common.js');
const {merge} = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-cheap-source-map',
    target: ['web'],
    devServer: {
        client: {
            webSocketURL: 'auto://0.0.0.0:0/ws',
        },
        port: 5678,
        hot: true,
        static: './public',
        allowedHosts: ['.pkaindextest.com'],
        historyApiFallback: true,
    },
    output: {
        publicPath: '/',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Development',
            template: './public/index.html',
            filename: 'index.html',
            hash: true,
        }),
        new ReactRefreshWebpackPlugin(),
    ],
});
