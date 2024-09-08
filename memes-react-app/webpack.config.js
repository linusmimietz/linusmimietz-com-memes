const path = require("path");

module.exports = {
  output: {
    filename: "static/js/[name].[contenthash:8].js",
    chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
    publicPath: "https://linus-mimietz-com-memes-react.fra1.cdn.digitaloceanspaces.com/",
  },
};
