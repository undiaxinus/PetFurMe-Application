import { StyleSheet } from 'react-native';

export const toastStyles = StyleSheet.create({
  toast: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  }
}); 