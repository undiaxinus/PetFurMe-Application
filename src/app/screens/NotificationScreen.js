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
import { useNotifications } from '../context/NotificationContext';

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
  CHECKUP_RESULT: 'checkup_result',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed'
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
  const { updateNotificationStatus } = useNotifications();

  // Load notifications immediately when user_id is available
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        let currentUserId = user_id;
        if (!currentUserId) {
          currentUserId = await AsyncStorage.getItem('user_id');
          if (currentUserId) {
            setUserId(currentUserId);
            await fetchNotifications(currentUserId);
          } else {
            console.error('No user_id found');
            navigation.navigate('LoginScreen');
            return;
          }
        } else {
          await fetchNotifications(currentUserId);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load notifications');
      }
    };

    loadInitialData();
  }, [user_id]); // Depend on user_id changes

  // Set up auto-refresh separately
  useEffect(() => {
    if (user_id) {
      // Check for new notifications every 30 seconds
      refreshIntervalRef.current = setInterval(() => {
        fetchNotifications(user_id);
        checkAppointmentStatusChanges(user_id);
      }, 30000);

      // Request permissions after initial load
      requestNotificationPermissions();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user_id]);

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

  const fetchNotifications = async (currentUserId) => {
    try {
      const response = await axios.get(
        `http://${SERVER_IP}/PetFurMe-Application/api/notifications/get_notifications.php?user_id=${currentUserId}`,
        { timeout: 5000 }
      );

      if (response.data?.success) {
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          notifiable_type: notification.notifiable_type,
          notifiable_id: notification.notifiable_id,
          data: notification.data,
          read: notification.read_at !== null,
          created_at: notification.created_at
        }));

        setNotifications(formattedNotifications);
        
        // Update global notification status based on whether any notifications are unread
        const hasUnread = formattedNotifications.some(notification => !notification.read);
        updateNotificationStatus(hasUnread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkAppointmentStatusChanges = async (currentUserId) => {
    try {
      const response = await axios.get(
        `http://${SERVER_IP}/PetFurMe-Application/api/appointments/check_status_changes.php?user_id=${currentUserId}`,
        { timeout: 5000 }
      );

      if (response.data?.success && response.data.new_notifications > 0) {
        // Fetch notifications again to get the new ones
        await fetchNotifications(currentUserId);
      }
    } catch (err) {
      console.error('Error checking appointment status changes:', err);
    }
  };

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
        const updatedNotifications = notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        );
        setNotifications(updatedNotifications);
        
        // Check if there are any remaining unread notifications
        const hasUnread = updatedNotifications.some(notification => !notification.read);
        updateNotificationStatus(hasUnread);
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

  const deleteNotification = async (id) => {
    try {
      const response = await axios.post(
        `http://${SERVER_IP}/PetFurMe-Application/api/notifications/delete_notification.php`,
        {
          notification_id: id,
          user_id: user_id
        }
      );

      if (response.data.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      } else {
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      Alert.alert(
        'Error',
        'Failed to delete notification. Please try again.'
      );
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (user_id) {
      await fetchNotifications(user_id);
    }
    setIsRefreshing(false);
  }, [user_id]);

  const renderNotification = useCallback(({ item }) => {
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
        case NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED:
          return <MaterialIcons name="check-circle" size={24} color="#4CAF50" />;
        default:
          return <MaterialIcons name="notifications" size={24} color="#8146C1" />;
      }
    };

    // Add handlePress function to mark notification as read
    const handlePress = async () => {
      if (!item.read) {
        try {
          const response = await axios.post(
            `http://${SERVER_IP}/PetFurMe-Application/api/notifications/mark_as_read.php`,
            {
              notification_id: item.id,
              user_id: user_id
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          
          if (response.data.success) {
            const updatedNotifications = notifications.map((notification) =>
              notification.id === item.id ? { ...notification, read: true } : notification
            );
            setNotifications(updatedNotifications);
            
            // Check if there are any remaining unread notifications
            const hasUnread = updatedNotifications.some(notification => !notification.read);
            updateNotificationStatus(hasUnread);
          }
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
    };

    return (
      <TouchableOpacity onPress={handlePress}>
        <View style={[
          styles.notificationItem,
          item.read ? styles.read : styles.unread,
          item.type === NOTIFICATION_TYPES.LOW_STOCK && styles.warningNotification,
          item.type === NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED && styles.appointmentNotification,
          item.type === NOTIFICATION_TYPES.NEW_PRODUCT && styles.newProductNotification,
        ]}>
          <View style={styles.iconContainer}>
            {getNotificationIcon()}
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.notificationTitle, !item.read && styles.boldTitle]}>
              {item.type.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Text>
            <Text style={styles.notificationDescription}>
              {JSON.parse(item.data).message}
            </Text>
            <Text style={styles.notificationTime}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [notifications, user_id, updateNotificationStatus]);

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
        scrollEnabled={true}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error || 'Loading notifications...'}
            </Text>
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
    alignItems: 'flex-start',
    padding: 14,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#8146C1',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 14,
    padding: 8,
    backgroundColor: '#f8f4ff',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  boldTitle: {
    fontWeight: '700',
  },
  notificationDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unread: {
    backgroundColor: '#f0e6ff',
  },
  read: {
    backgroundColor: '#ffffff',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8146C1',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  actionContainer: {
    flexDirection: 'row',
  },
  markReadAction: {
    backgroundColor: '#8146C1',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
  listContainer: {
    flexGrow: 1,
    paddingTop: 8,
  },
  warningNotification: {
    borderLeftColor: '#FFA500',
  },
  appointmentNotification: {
    borderLeftColor: '#4CAF50',
  },
  newProductNotification: {
    borderLeftColor: '#2196F3',
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