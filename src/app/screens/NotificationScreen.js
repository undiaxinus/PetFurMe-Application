import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl, Alert, Animated, Linking } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL, SERVER_IP } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';
import { Swipeable } from 'react-native-gesture-handler';

// Add this at the top level
const configureNotifications = Platform.OS === 'web' 
  ? {
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false, // Badges aren't supported on web
      }),
    }
  : {
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    };

// Set default notification handler
Notifications.setNotificationHandler(configureNotifications);

// Add these notification type constants at the top of the file
const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  NEW_PRODUCT: 'new_product',
  LOW_STOCK: 'low_stock',
  CHECKUP_RESULT: 'checkup_result'
};

const NotificationScreen = ({ navigation, route }) => {
  const [user_id, setUserId] = useState(route.params?.user_id);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const lastFetchRef = useRef(Date.now());
  const REFRESH_COOLDOWN = 1000;
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Request permissions
        await requestNotificationPermissions();
        
        // Get user ID
        let currentUserId = user_id;
        if (!currentUserId) {
          currentUserId = await AsyncStorage.getItem('user_id');
          if (currentUserId) {
            setUserId(currentUserId);
          } else {
            console.error('No user_id found');
            navigation.navigate('LoginScreen');
            return;
          }
        }
        
        // Fetch notifications immediately
        await fetchNotifications(currentUserId);
        
        // Set up auto refresh every 30 seconds instead of 60
        refreshIntervalRef.current = setInterval(() => {
          if (currentUserId && !isRefreshing) {
            console.log('Auto-refreshing notifications...');
            fetchNotifications(currentUserId);
          }
        }, 30000);
      } catch (err) {
        console.error('Error during initialization:', err);
        setError('Failed to initialize notifications');
      }
    };

    initializeScreen();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const requestNotificationPermissions = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web notification permissions
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          setPermissionStatus('unsupported');
          return false;
        }

        let permission = Notification.permission;
        
        if (permission === 'denied') {
          console.log('Notification permission previously denied');
          setPermissionStatus('denied');
          Alert.alert(
            'Notifications Blocked',
            'Please enable notifications in your browser settings to receive updates.',
            [
              {
                text: 'Learn How',
                onPress: () => {
                  // You could navigate to a help screen here
                  navigation.navigate('NotificationHelp');
                }
              },
              { text: 'OK' }
            ]
          );
          return false;
        }

        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
          setPermissionStatus('granted');
          return true;
        }

      } else {
        // Mobile notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          setPermissionStatus('denied');
          Alert.alert(
            'Notification Permission Required',
            'Please enable notifications in your device settings to receive updates.',
            [
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              },
              { text: 'Cancel' }
            ]
          );
          return false;
        }
        
        setPermissionStatus('granted');
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setPermissionStatus('error');
      return false;
    }
  };

  const showLocalNotification = async (title, message) => {
    try {
      if (permissionStatus !== 'granted') {
        const granted = await requestNotificationPermissions();
        if (!granted) return;
      }

      if (Platform.OS === 'web') {
        // Web notification
        new Notification(title, {
          body: message,
          icon: '/path/to/your/icon.png' // Add your notification icon
        });
      } else {
        // Mobile notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: title,
            body: message,
            sound: true,
            priority: 'high',
          },
          trigger: null, // null means show immediately
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const fetchNotifications = useCallback(async (currentUserId, isManualRefresh = false) => {
    if (!isManualRefresh && Date.now() - lastFetchRef.current < REFRESH_COOLDOWN) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://${SERVER_IP}/PetFurMe-Application/api/notifications/get_notifications.php?user_id=${currentUserId}`,
        { timeout: 5000 }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (response.data.success) {
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          notifiable_type: notification.notifiable_type,
          notifiable_id: notification.notifiable_id,
          data: notification.data,
          read: notification.read_at !== null,
          created_at: notification.created_at
        }));

        // Show new notifications
        if (!isManualRefresh) {
          const newNotifications = formattedNotifications.filter(
            notification => !notification.read && 
            !notifications.find(n => n.id === notification.id)
          );

          for (const notification of newNotifications) {
            const data = JSON.parse(notification.data);
            await showLocalNotification(
              notification.type.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              data.message
            );
          }
        }

        setNotifications(formattedNotifications);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to load notifications');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(err.message || 'Failed to load notifications');
      }
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      lastFetchRef.current = Date.now();
    }
  }, [notifications, permissionStatus]);

  const markAsRead = async (id) => {
    try {
      console.log('Marking notification as read:', id);
      
      if (!id) {
        throw new Error('Invalid notification ID');
      }

      const response = await axios.post(
        `http://${SERVER_IP}/PetFurMe-Application/api/notifications/mark_as_read.php`,
        {
          notification_id: id,
          user_id: user_id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Mark as read response:', response.data);
      
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      } else {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      Alert.alert(
        'Error',
        err.message || 'Failed to mark notification as read. Please try again.'
      );
    }
  };

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    if (user_id) {
      await fetchNotifications(user_id, true);
    }
    setIsRefreshing(false);
  }, [user_id, fetchNotifications, isRefreshing]);

  const renderNotification = useCallback(({ item }) => {
    const renderRightActions = (progress, dragX) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <TouchableOpacity 
          style={styles.deleteAction}
          onPress={() => markAsRead(item.id)}
        >
          <Animated.Text 
            style={[styles.actionText, { transform: [{ scale }] }]}
          >
            Mark as Read
          </Animated.Text>
        </TouchableOpacity>
      );
    };

    const getNotificationIcon = () => {
      switch (item.type) {
        case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
          return <MaterialIcons name="event" size={24} color="#8146C1" />;
        case NOTIFICATION_TYPES.NEW_PRODUCT:
          return <MaterialIcons name="new-releases" size={24} color="#8146C1" />;
        case NOTIFICATION_TYPES.LOW_STOCK:
          return <MaterialIcons name="warning" size={24} color="#FFA500" />;
        case NOTIFICATION_TYPES.CHECKUP_RESULT:
          return <MaterialIcons name="medical-services" size={24} color="#8146C1" />;
        default:
          return <MaterialIcons name="notifications" size={24} color="#8146C1" />;
      }
    };

    const handleNotificationPress = () => {
      switch (item.type) {
        case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
          navigation.navigate('AppointmentDetails', { 
            appointment_id: item.notifiable_id 
          });
          break;
        case NOTIFICATION_TYPES.NEW_PRODUCT:
          navigation.navigate('ProductDetails', { 
            product_id: JSON.parse(item.data).product_id 
          });
          break;
        case NOTIFICATION_TYPES.CHECKUP_RESULT:
          navigation.navigate('CheckupDetails', { 
            checkup_id: JSON.parse(item.data).checkup_id 
          });
          break;
        default:
          // Handle other notification types
          break;
      }
      markAsRead(item.id);
    };

    const getNotificationColor = () => {
      switch (item.type) {
        case NOTIFICATION_TYPES.LOW_STOCK:
          return styles.warningNotification;
        case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
          return styles.appointmentNotification;
        case NOTIFICATION_TYPES.NEW_PRODUCT:
          return styles.newProductNotification;
        default:
          return item.read ? styles.read : styles.unread;
      }
    };

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity onPress={handleNotificationPress}>
          <Animated.View style={[
            styles.notificationItem,
            getNotificationColor()
          ]}>
            <View style={styles.iconContainer}>
              {getNotificationIcon()}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notificationTitle}>
                {item.type.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Text>
              <Text style={styles.notificationDescription} numberOfLines={2}>
                {JSON.parse(item.data).message}
              </Text>
              <Text style={styles.notificationTime}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Swipeable>
    );
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Notifications"
        subtitle="Stay updated with your activities"
        navigation={navigation}
        showBackButton={true}
        showDrawerButton={true}
      />

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#8146C1']}
            tintColor="#8146C1"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#8146C1" />
            ) : (
              <Text style={styles.emptyText}>
                {error || 'No notifications available.'}
              </Text>
            )}
          </View>
        )}
      />

      <BottomNavigation activeScreen="NotificationScreen" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  read: {
    backgroundColor: '#ffffff',
  },
  unread: {
    backgroundColor: '#f8f4ff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 8,
  },
  deleteAction: {
    backgroundColor: '#8146C1',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  warningNotification: {
    backgroundColor: '#FFF3E0',
  },
  appointmentNotification: {
    backgroundColor: '#E8F5E9',
  },
  newProductNotification: {
    backgroundColor: '#E3F2FD',
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default React.memo(NotificationScreen);