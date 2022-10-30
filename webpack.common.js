const path = require("path");

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
                loader: "swc-loader",
                exclude: [
                    {
                        and: [/node_modules/],
                        not: [/flatbuffers/, /scroll-js/],
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff)$/i,
                use: ["asset/resource"],
                dependency: { not: ['url'] },
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".tsx", ".ts", ".json"],
    },
};
