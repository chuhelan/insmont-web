const config = require("./webpack.config");
const webpack = require('webpack');

module.exports = {
  ...config,
  mode: "production",
};
