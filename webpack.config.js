const path = require('path');

module.exports = {
  // ... other webpack config
  resolve: {
    alias: {
      'src/assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  // ... other webpack config
}; 