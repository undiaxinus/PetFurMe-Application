import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL, SERVER_IP } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notifications for local only
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationScreen = ({ navigation, route }) => {
  const [user_id, setUserId] = useState(route.params?.user_id);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const lastFetchRef = useRef(Date.now());
  const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refreshes

  useEffect(() => {
    const getUserIdAndFetch = async () => {
      try {
        if (!user_id) {
          const storedUserId = await AsyncStorage.getItem('user_id');
          if (storedUserId) {
            setUserId(storedUserId);
            fetchNotifications(storedUserId);
          } else {
            console.error('No user_id found');
            navigation.navigate('LoginScreen');
          }
        } else {
          fetchNotifications(user_id);
        }
      } catch (err) {
        console.error('Error getting user_id:', err);
        setError('Failed to get user session');
      }
    };

    // Initial fetch
    getUserIdAndFetch();

    // Set up auto refresh every 1 minute (60000ms)
    refreshIntervalRef.current = setInterval(() => {
      if (user_id && !isRefreshing) {
        console.log('Auto-refreshing notifications...');
        fetchNotifications(user_id);
      }
    }, 60000);

    // Request notification permissions
    requestNotificationPermissions();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user_id, isRefreshing]);

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get notification permissions');
        return;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const showLocalNotification = async (title, message) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: message,
          sound: true,
          priority: 'high',
        },
        trigger: null, // null means show immediately
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const fetchNotifications = useCallback(async (currentUserId, isManualRefresh = false) => {
    // Prevent rapid refreshes unless it's a manual refresh
    if (!isManualRefresh && Date.now() - lastFetchRef.current < REFRESH_COOLDOWN) {
      return;
    }

    try {
      if (!isManualRefresh) {
        setLoading(true);
      }
      console.log('Fetching notifications for user:', currentUserId);
      
      const response = await axios.get(
        `http://${SERVER_IP}/PetFurMe-Application/api/notifications/get_notifications.php?user_id=${currentUserId}`
      );
      
      console.log('Notifications response:', response.data);
      
      if (response.data.success) {
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification.id,
          title: notification.type,
          description: notification.data,
          read: notification.read_at !== null,
          created_at: notification.created_at,
          type: notification.notifiable_type
        }));

        // Only show notifications for new items if it's not a manual refresh
        if (!isManualRefresh) {
          const newNotifications = formattedNotifications.filter(
            notification => !notification.read && 
            !notifications.find(n => n.id === notification.id)
          );

          newNotifications.forEach(notification => {
            showLocalNotification(
              notification.title,
              notification.description
            );
          });
        }

        setNotifications(formattedNotifications);
        setError(null);
        lastFetchRef.current = Date.now();
      } else {
        throw new Error(response.data.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [notifications]);

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
    const notificationStyle = [
      styles.notificationItem,
      item.read ? styles.read : styles.unread
    ];

    return (
      <TouchableOpacity
        style={notificationStyle}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationDescription}>{item.description}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" top={15}/>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Stay updated with your activities</Text>
        </View>
      </View>

      {loading && !isRefreshing ? (
        <ActivityIndicator size="large" color="#8146C1" style={styles.centerContent} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications available.</Text>
      ) : (
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
            <Text style={styles.emptyText}>No notifications available.</Text>
          )}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('HomePage')}
        >
            <Ionicons name="home-outline" size={24} color="#8146C1" />
            <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('ChatScreen')}
        >
            <Ionicons name="chatbubble-outline" size={24} color="#8146C1" />
            <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
            <Ionicons name="notifications" size={24} color="#8146C1" />
            <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Help')}
        >
            <Ionicons name="help-circle-outline" size={24} color="#8146C1" />
            <Text style={styles.navText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    backgroundColor: '#8146C1',
    height: 120,
  },
  headerTitleContainer: {
    alignContent: 'center',
    alignItems: 'center',
    left: -30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    left: 65,
    top: 18,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#cccccc',
    marginTop: 2,
    top: 15,
    left: 75,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    top: 35,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
  },
  read: {
    opacity: 0.6,
  },
  unread: {
    backgroundColor: '#e8dff7',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#aaa',
    marginTop: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#8146C1',
    marginTop: 4,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
  },
});

export default React.memo(NotificationScreen);