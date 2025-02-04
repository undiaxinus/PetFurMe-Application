// Standardized button component
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled,
  loading,
  icon,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon && <Icon name={icon} style={styles.buttonIcon} />}
          <Text style={[styles.buttonText, styles[`${variant}Text`]]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}; 