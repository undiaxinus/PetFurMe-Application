// Common styles that can be reused across components
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#8146C1',
  },
  // ... other common styles
});

// Theme constants
export const theme = {
  colors: {
    primary: '#8146C1',
    secondary: '#CC38F2',
    background: '#FFFFFF',
    text: '#333333',
    border: '#E0E0E0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}; 