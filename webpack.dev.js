const common = require('./webpack.common.js');
const {merge} = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    target: ['web'],
    devServer: {
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
    ],
});
