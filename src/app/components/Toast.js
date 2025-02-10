import { Platform } from 'react-native';

// Only import ToastAndroid for Android platform
const ToastAndroid = Platform.select({
  android: () => require('react-native').ToastAndroid,
  default: () => null,
})();

export const Toast = {
  SHORT: 2000,
  LONG: 3500,

  show: (message, duration = 2000) => {
    if (Platform.OS === 'android' && ToastAndroid) {
      // Use ToastAndroid on Android
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else if (Platform.OS === 'web') {
      // Use browser's native toast or create a custom one for web
      const toastDiv = document.createElement('div');
      toastDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 9999;
        font-family: system-ui;
        font-size: 14px;
        transition: opacity 0.3s ease-in-out;
      `;
      toastDiv.textContent = message;
      document.body.appendChild(toastDiv);

      // Fade in
      setTimeout(() => {
        toastDiv.style.opacity = '1';
      }, 100);

      // Remove after duration
      setTimeout(() => {
        toastDiv.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(toastDiv)) {
            document.body.removeChild(toastDiv);
          }
        }, 300);
      }, duration);
    } else {
      // For iOS, you might want to use a custom alert or third-party library
      console.log(message);
    }
  }
};

// Optional: Add more toast methods if needed
Toast.success = (message, duration) => {
  Toast.show(message, duration);
};

Toast.error = (message, duration) => {
  Toast.show(message, duration);
};

Toast.info = (message, duration) => {
  Toast.show(message, duration);
}; 