import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNavigation = ({ activeScreen, user_id }) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // If user_id is not passed as prop, try to get it from route params
  const currentUserId = user_id || route.params?.user_id;

  // Add this function to normalize screen names
  const normalizeScreenName = (screenName) => {
    const screenMap = {
      'ChatSupport': 'ChatScreen',
      'Chat': 'ChatScreen',
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
      if (!currentUserId && screen !== 'HomePage') {
        // If no user_id and not going to HomePage, redirect to login
        navigation.navigate('LoginScreen');
        return;
      }
      
      navigation.navigate(screen, { 
        user_id: currentUserId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Handle navigation error gracefully
    }
  };

  const getTabStyle = (screen) => {
    return {
      transform: [
        {
          scale: animations[screen].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }),
        },
        {
          translateY: animations[screen].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -8], // Pop up animation
          }),
        }
      ],
      opacity: animations[screen].interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 1],
      }),
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.bottomNav}>
        <View style={styles.background} />
        {/* Navigation Items */}
        {[
          { screen: 'HomePage', icon: 'home', label: 'Home' },
          { screen: 'ChatScreen', icon: 'chatbubble', label: 'Chat' },
          { screen: 'NotificationScreen', icon: 'notifications', label: 'Notifications' },
          { screen: 'Help', icon: 'help-circle', label: 'FAQ' }
        ].map(({ screen, icon, label }) => (
          <TouchableOpacity 
            key={screen}
            style={styles.navItem}
            onPress={() => handleNavigation(screen)}
          >
            <Animated.View style={[styles.iconContainer, getTabStyle(screen)]}>
              <Ionicons 
                name={currentScreen === screen ? icon : `${icon}-outline`}
                size={24} 
                color="#8146C1" 
              />
              <Text style={[
                styles.navText, 
                currentScreen === screen && styles.activeText
              ]}>{label}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    zIndex: 1000,
    elevation: 8,
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
    borderTopWidth: 1,
    borderColor: 'rgba(129, 70, 193, 0.1)',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginHorizontal: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  navText: {
    fontSize: 11,
    color: '#8146C1',
    marginTop: 2,
    opacity: 0.8,
  },
  activeText: {
    fontWeight: '600',
    opacity: 1,
  }
});

export default BottomNavigation; 