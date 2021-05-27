const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            filename: "index.html",
            hash: true,
        }),
        new FaviconsWebpackPlugin("./public/favicon.svg"),
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.(ts|tsx|js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(ts|tsx|js|css|html|svg)$/,
            compressionOptions: { level: 11 },
            threshold: 10240,
            minRatio: 0.8,
        }),
    ],
});
