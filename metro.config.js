const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add this configuration
config.resolver.extraNodeModules = {
  'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
};

config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.assetExts = [
  'png', 'jpg', 'jpeg', 'gif', 'svg', 
  'ttf', 'woff', 'woff2', 'eot', 'otf'
];
config.transformer.minifierConfig.compress.drop_console = false; // Enable console logs during development

// Add this section
config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.endsWith('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (req.url.match(/\.(ttf|otf|woff|woff2|eot)$/)) {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config; 