// Standardized input component
export const FormInput = ({
  label,
  icon,
  error,
  touched,
  ...props
}) => {
  return (
    <View style={styles.inputGroup}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        error && touched && styles.inputError
      ]}>
        {icon && <Icon name={icon} style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          {...props}
        />
      </View>
      {error && touched && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}; 