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
  user_id,
  onMenuPress
}) => {
  console.log("CustomHeader rendering with props:", {
    title,
    showBackButton,
    showDrawerButton,
    navigation: !!navigation
  });

  return (
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
            onPress={onMenuPress || (() => {
              console.log("Menu button pressed");
              if (navigation?.openDrawer) {
                navigation.openDrawer();
              }
            })}
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
            onPress={() => {
                if (user_id) {
                    navigation.navigate('ProfileVerification', { 
                        user_id: user_id,
                        onComplete: () => {
                            // Optional: Add any completion callback logic here
                        }
                    });
                } else {
                    console.warn('No user_id provided to CustomHeader');
                }
            }}
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
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8146C1',
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
    paddingHorizontal: 16,
    zIndex: 1000,
    elevation: 3,
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