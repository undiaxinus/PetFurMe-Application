import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl, Alert, Animated } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL, SERVER_IP } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';
import { Swipeable } from 'react-native-gesture-handler';

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
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const lastFetchRef = useRef(Date.now());
  const REFRESH_COOLDOWN = 5000;

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
    if (!isManualRefresh && Date.now() - lastFetchRef.current < REFRESH_COOLDOWN) {
      return;
    }

    try {
      console.log('Fetching notifications for user:', currentUserId);
      
      const response = await axios.get(
        `http://${SERVER_IP}/PetFurMe-Application/api/notifications/get_notifications.php?user_id=${currentUserId}`
      );
      
      if (response.data.success) {
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification.id,
          title: notification.type,
          description: notification.data,
          read: notification.read_at !== null,
          created_at: notification.created_at,
          type: notification.notifiable_type
        }));

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

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <Animated.View style={[
          styles.notificationItem,
          item.read ? styles.read : styles.unread
        ]}>
          <View style={styles.textContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.notificationTime}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Animated.View>
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
            <Text style={styles.emptyText}>
              {error || 'No notifications available.'}
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
    paddingBottom: 90,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
});

export default React.memo(NotificationScreen);