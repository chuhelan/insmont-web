const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const glob = require("glob");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          compress: {
            drop_console: true,
            drop_debugger: true,
            dead_code: true,
            hoist_funs: true,
            hoist_vars: true,
            reduce_vars: true,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: "all",
    },
  },
  entry: glob.sync("./src/**/*.ts").reduce((acc, path) => {
    const entry = path.replace("./src/", "").replace(".ts", "");
    acc[entry] = path;
    return acc;
  }, {}),
  mode: "production",
  devServer: {
    watchFiles: ["src/**/*"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    ...glob.sync("./src/**/*.html").map((path) => {
      const filename = path.replace("./src/", "");
      return new HtmlWebpackPlugin({
        template: path,
        filename: filename,
        chunks: [filename.replace(".html", "")],
      });
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/assets", to: "assets" }
      ],
    }),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
