import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVER_IP } from '../config/constants';
import axios from 'axios';

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
  const API_BASE_URL = `http://${SERVER_IP}`;
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const getUserData = async () => {
    if (!user_id) return null;
    
    try {
      console.log("Fetching data for user_id:", user_id);
      
      const response = await fetch(
        `${API_BASE_URL}/PetFurMe-Application/api/users/get_user_data.php?user_id=${user_id}&t=${Date.now()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const userData = {
          user_id: user_id,
          name: data.profile.name,
          username: data.profile.username,
          role: data.profile.role,
          photo: data.profile.photo
        };
        
        console.log("Processed user data:", userData);
        return userData;
      }
    } catch (error) {
      console.error("Error in getUserData:", error);
    }
    return null;
  };

  const fetchUserPhoto = async () => {
    if (!user_id) return;
    
    try {
      const photoUrl = `${API_BASE_URL}/PetFurMe-Application/api/users/get_user_photo.php?user_id=${user_id}`;
      console.log("Header: Fetching user photo from:", photoUrl);
      
      const photoResponse = await axios.get(photoUrl);
      
      if (photoResponse.data.success) {
        if (photoResponse.data.source === 'photo_data') {
          // Handle binary data returned as base64
          const base64Data = photoResponse.data.photo;
          console.log("Header: Received photo as base64");
          
          setProfileImage({
            uri: `data:image/jpeg;base64,${base64Data}`
          });
        } else if (photoResponse.data.photo_path) {
          // Handle traditional file path
          const filePhotoUrl = `${API_BASE_URL}/PetFurMe-Application/uploads/${photoResponse.data.photo_path}`;
          
          setProfileImage({
            uri: filePhotoUrl
          });
        } else {
          setProfileImage(null);
        }
      } else {
        console.log("No photo found for user in header");
        setProfileImage(null);
      }
    } catch (error) {
      console.error("Error fetching user photo in header:", error);
      setProfileImage(null);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
        fetchUserPhoto();
      }
    };
    
    loadUserData();
    // Refresh user data every 10 seconds
    const refreshInterval = setInterval(loadUserData, 10000);
    return () => clearInterval(refreshInterval);
  }, [user_id]);

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
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            {subtitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text>
            )}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {showProfileButton && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => {
                navigation.navigate('ProfileVerification', { 
                  user_id,
                  initial: { user_id }
                });
              }}
            >
              {profileImage ? (
                <Image
                  source={profileImage}
                  style={styles.profilePhoto}
                  onError={(e) => {
                    console.error('Error loading profile image in header:', e.nativeEvent);
                    setProfileImage(null);
                  }}
                />
              ) : (
                <Image
                  source={{ uri: `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/avatar.png` }}
                  style={styles.profilePhoto}
                />
              )}
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
    height: Platform.OS === 'ios' ? 100 : 90,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 8,
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
  logoImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 2,
  },
  profilePhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

export default CustomHeader; 