module.exports = function(config) {
  // Ensure extra and extra.doctor exist
  config.extra = config.extra || {};
  config.extra.doctor = config.extra.doctor || {};
  
  // Configure reactNativeDirectoryCheck within extra.doctor
  config.extra.doctor.reactNativeDirectoryCheck = {
    listUnknownPackages: false,
    exclude: [
      "@expo/metro-runtime",
      "@iconify/react",
      "@react-native/gradle-plugin",
      "body-parser",
      "cookie-parser",
      "cors",
      "express",
      "moment", 
      "mysql2",
      "react-datepicker",
      "react-native-modal-overlay",
      "uuid"
    ]
  };
  
  // Remove any incorrect properties that might have been added
  if (config.doctor) {
    delete config.doctor;
  }
  
  if (config.excludeAssets) {
    delete config.excludeAssets;
  }
  
  return config;
}; 