const withTM = require("next-transpile-modules")([
  "three",
  "react-three-fiber",
  "drei",
]);

module.exports = withTM({
  webpack(config, options) {
    // File loader for gltf/glb files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: "file-loader",
      },
    });

    // GLSL loader for shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      use: {
        loader: "webpack-glsl-loader",
      },
    });

    return config;
  },
});
