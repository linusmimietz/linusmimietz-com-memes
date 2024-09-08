const postcssPrefix = require("postcss-prefix-selector");

module.exports = function override(config, env) {
  // Find the CSS rule
  const cssRule = config.module.rules.find((rule) => rule.oneOf && rule.oneOf.find((r) => r.test && r.test.toString().includes(".css")));

  // Find the CSS loader
  const cssLoader = cssRule.oneOf.find((r) => r.test && r.test.toString().includes(".css"));

  // Add postcss-loader with our custom plugin
  cssLoader.use.push({
    loader: require.resolve("postcss-loader"),
    options: {
      postcssOptions: {
        plugins: [
          postcssPrefix({
            prefix: "#react-root-meme-app",
            exclude: [":root", "body", "html"],
          }),
        ],
      },
    },
  });

  return config;
};
