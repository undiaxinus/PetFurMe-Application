const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add custom configurations if needed
config.resolver.assetExts.push('png');

module.exports = config; 