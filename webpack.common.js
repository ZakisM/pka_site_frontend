const path = require("path");
const babelLoaderExcludeNodeModulesExcept = require("babel-loader-exclude-node-modules-except");

module.exports = {
    entry: ["./src/index.tsx"],
    output: {
        filename: "pka-index-frontend.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/i,
                exclude: babelLoaderExcludeNodeModulesExcept(["scroll-js"]),
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    useBuiltIns: "entry",
                                    corejs: 3,
                                },
                            ],
                            "@babel/react",
                            "@babel/preset-typescript",
                        ],
                        plugins: ["transform-class-properties"],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".tsx", ".ts", ".json"],
    },
};
