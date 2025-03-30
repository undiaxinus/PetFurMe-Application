import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/common';

// Create reusable components for common UI elements
export const Header = ({ title, showBack, onBack }) => {
  return (
    <View style={commonStyles.header}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}; 