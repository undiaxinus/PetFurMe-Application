import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, Alert, AsyncStorage } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNotifications } from '../context/NotificationContext';

const BottomNavigation = ({ activeScreen = 'HomePage', user_id, isVerified: propIsVerified }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hasUnreadNotifications, checkUnreadNotifications } = useNotifications();
  const [isVerified, setIsVerified] = useState(propIsVerified || false);
  
  // Check verification status from AsyncStorage
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const storedVerification = await AsyncStorage.getItem('isVerified');
        if (storedVerification !== null) {
          setIsVerified(JSON.parse(storedVerification));
        }
      } catch (error) {
        console.error('Error reading verification status:', error);
      }
    };

    checkVerificationStatus();
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    setIsVerified(propIsVerified);
  }, [propIsVerified]);

  // Check for unread notifications when component mounts
  useEffect(() => {
    checkUnreadNotifications();
  }, []);

  // If user_id is not passed as prop, try to get it from route params
  const currentUserId = user_id || route.params?.user_id;

  // Add this function to normalize screen names
  const normalizeScreenName = (screenName) => {
    const screenMap = {
      'ChatSupport': 'ChatScreen',
      'Chat': 'ChatScreen',
      'FAQ': 'Help',
      'Appointments': 'Appointment',
      // Add other screen name mappings if needed
    };
    return screenMap[screenName] || screenName;
  };

  // Update the activeScreen check to use normalized names
  const currentScreen = normalizeScreenName(activeScreen || route.name);

  // Create animation values with useRef to persist across re-renders
  const animations = React.useRef({
    HomePage: new Animated.Value(currentScreen === 'HomePage' ? 1 : 0),
    ChatScreen: new Animated.Value(currentScreen === 'ChatScreen' ? 1 : 0),
    NotificationScreen: new Animated.Value(currentScreen === 'NotificationScreen' ? 1 : 0),
    Help: new Animated.Value(currentScreen === 'Help' ? 1 : 0),
    Appointment: new Animated.Value(currentScreen === 'Appointment' ? 1 : 0),
  }).current;

  // Reset animations when activeScreen changes
  React.useEffect(() => {
    // Reset all animations first
    Object.keys(animations).forEach(screen => {
      Animated.timing(animations[screen], {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    // Animate the active screen
    if (animations[currentScreen]) {
      Animated.timing(animations[currentScreen], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentScreen, animations]);

  const handleNavigation = (screen) => {
    try {
      // Check for verification status for Appointment screen
      if (screen === 'Appointment' && !isVerified) {
        Alert.alert(
          "Account Pending Verification",
          "Your account is currently pending verification by an administrator. This process helps ensure the safety and quality of our pet care community. You'll be notified once your account is verified.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      if (!currentUserId && screen !== 'HomePage') {
        navigation.navigate('LoginScreen');
        return;
      }
      
      navigation.navigate(screen, { 
        user_id: currentUserId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const getTabStyle = (screen) => {
    return {
      transform: [
        {
          scale: animations[screen].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          }),
        }
      ],
      opacity: animations[screen].interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 1],
      }),
    };
  };

  const styles = StyleSheet.create({
    container: {
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
      height: Platform.OS === 'ios' ? 110 : 96,
      zIndex: 1000,
      elevation: 8,
      borderTopWidth: 0,
    },
    background: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
      borderTopWidth: 0,
      marginTop: -1,
    },
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '100%',
      paddingHorizontal: 15,
      paddingBottom: 0,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
      marginHorizontal: 5,
    },
    homeItem: {
      marginTop: -25,
    },
    homeIconContainer: {
      backgroundColor: '#f0e6f7',
      padding: 16,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: '#8146C1',
      elevation: 4,
      shadowColor: '#8146C1',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    iconContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navText: {
      fontSize: 11,
      color: '#8146C1',
      marginTop: 4,
      opacity: 0.8,
    },
    activeText: {
      fontWeight: '600',
      opacity: 1,
      color: '#8146C1',
    },
    notificationBadge: {
      position: 'absolute',
      right: -2,
      top: -2,
      backgroundColor: '#FF4444',
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#fff',
    },
    badgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    disabledNavItem: {
      opacity: 0.5,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.bottomNav}>
        <View style={styles.background} />
        {/* Navigation Items */}
        {[
          { screen: 'ChatScreen', icon: 'chatbubble', label: 'Chat' },
          { screen: 'Appointment', icon: 'calendar', label: 'Appointments', requiresVerification: true },
          { screen: 'HomePage', icon: 'paw', label: 'Home' },
          { screen: 'NotificationScreen', icon: 'notifications', label: 'Notifications' },
          { screen: 'Help', icon: 'help-circle', label: 'FAQ' }
        ].map(({ screen, icon, label, requiresVerification }) => (
          <TouchableOpacity 
            key={screen}
            style={[
              styles.navItem,
              screen === 'HomePage' && styles.homeItem,
              requiresVerification && !isVerified && styles.disabledNavItem
            ]}
            onPress={() => handleNavigation(screen)}
            disabled={requiresVerification && !isVerified}
          >
            <Animated.View style={[
              styles.iconContainer, 
              getTabStyle(screen),
              screen === 'HomePage' && styles.homeIconContainer
            ]}>
              <Ionicons 
                name={currentScreen === screen ? icon : `${icon}-outline`}
                size={screen === 'HomePage' ? 32 : 24}
                color={requiresVerification && !isVerified ? '#CCCCCC' : 
                      currentScreen === screen ? '#8146C1' : '#8146C1'}
              />
              {screen === 'NotificationScreen' && hasUnreadNotifications && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>•</Text>
                </View>
              )}
              <Text style={[
                styles.navText, 
                currentScreen === screen && styles.activeText,
                requiresVerification && !isVerified && { color: '#CCCCCC' }
              ]}>{label}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BottomNavigation; 