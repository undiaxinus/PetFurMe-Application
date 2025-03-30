import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      eas: {
        projectId: "6378a1f3-cb06-4f64-8c38-9f84b9627f12"
      },
      doctor: {
        reactNativeDirectoryCheck: {
          exclude: [
            "@expo/metro-runtime",
            "@iconify/react",
            "body-parser",
            "cookie-parser",
            "cors",
            "express",
            "moment",
            "mysql2",
            "react-datepicker",
            "uuid"
          ],
          listUnknownPackages: false
        }
      }
    },
    "assetBundlePatterns": [
      "assets/*"
    ]
  };
}; 