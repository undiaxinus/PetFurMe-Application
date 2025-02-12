import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomHeader = ({ 
  title, 
  subtitle, 
  navigation, 
  showBackButton = true,
  showDrawerButton = false,
  showProfileButton = false,
  userPhoto,
  user_id
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBackButton && !showDrawerButton && (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {showDrawerButton && (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => navigation.openDrawer()}
            >
              <Image
                source={require("../../assets/images/burger.png")}
                style={styles.menuIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          {subtitle && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {showProfileButton && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('ProfileVerification', { user_id })}
            >
              <Image
                source={userPhoto ? { uri: userPhoto } : require("../../assets/images/doprof.png")}
                style={styles.profilePhoto}
              />
            </TouchableOpacity>
          )}
          {!showProfileButton && <View style={styles.iconButton} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#8146C1',
    zIndex: 9999,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    marginTop: 2,
  },
  profilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default CustomHeader; 