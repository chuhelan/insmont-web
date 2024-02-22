const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
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
  entry: {
    ...glob.sync("./src/pages/**/*.ts").reduce((acc, path) => {
      const entryName = path.replace("./src/pages/", "").replace(".ts", "");
      acc[entryName] = path;
      return acc;
    }, {}),
  },
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
        include: path.resolve(__dirname, "src/styles"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets',
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/pages/index.html",
      filename: "index.html",
      chunks: ["index"],
  }),
  ...glob.sync("./src/pages/*/index.html").map((path) => {
      const folderName = path.replace(/^\.\/src\/pages\/(.*)\/index.html$/, "$1");
      return new HtmlWebpackPlugin({
          template: path,
          filename: `${folderName}/index.html`,
          chunks: [`${folderName}/${folderName}`],
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
