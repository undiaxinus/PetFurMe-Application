const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        '@react-native-masked-view/masked-view',
        'react-native-gesture-handler',
      ],
    },
  }, argv);

  config.devServer = {
    ...config.devServer,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  };

  // Add resolve.alias if it doesn't exist
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  
  // Add this alias
  config.resolve.alias['react-native-gesture-handler'] = 'react-native-gesture-handler/lib/commonjs/web';

  return config;
}; 