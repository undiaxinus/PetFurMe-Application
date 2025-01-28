const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add a fallback for the abort-controller
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "abort-controller": require.resolve("abort-controller")
  };

  return config;
}; 