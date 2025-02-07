import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { checkPasswordStrength } from '../utils/passwordStrength';

const PasswordStrengthIndicator = ({ password }) => {
  const { message, color, score, maxScore } = checkPasswordStrength(password || '');

  const renderStrengthBars = () => {
    const bars = [];
    for (let i = 0; i < maxScore; i++) {
      bars.push(
        <View
          key={i}
          style={[
            styles.strengthBar,
            { backgroundColor: password && i < score ? color : '#e0e0e0' }
          ]}
        />
      );
    }
    return bars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {renderStrengthBars()}
      </View>
      {password && <Text style={[styles.messageText, { color }]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    paddingHorizontal: 15,
    height: 16,
    zIndex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  messageText: {
    fontSize: 10,
    textAlign: 'left',
    lineHeight: 12,
  },
});

export default PasswordStrengthIndicator; 