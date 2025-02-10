const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@ui-kitten/components',
          '@react-native-async-storage/async-storage',
          'react-native-reanimated',
          '@react-native-picker/picker',
          'react-native-picker-select',
          '@expo-google-fonts/fredoka'
        ]
      }
    },
    argv
  );

  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-gesture-handler': 'react-native-web/dist/modules/GestureHandler'
  };

  config.resolve.extensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    ...config.resolve.extensions
  ];

  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    type: 'asset/resource'
  });

  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: ['@babel/plugin-proposal-class-properties']
      }
    }
  });

  return config;
}; 