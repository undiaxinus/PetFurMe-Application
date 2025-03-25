import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { SERVER_IP, API_BASE_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const checkUnreadNotifications = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) return;

      const response = await axios.get(
        `${API_BASE_URL}/notifications/check_unread.php?user_id=${user_id}`
      );

      if (response.data?.success) {
        setHasUnreadNotifications(response.data.hasUnread);
      }
    } catch (error) {
      console.error('Error checking unread notifications:', error);
    }
  };

  // Check for unread notifications on app start
  useEffect(() => {
    checkUnreadNotifications();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkUnreadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const updateNotificationStatus = (hasUnread) => {
    setHasUnreadNotifications(hasUnread);
  };

  return (
    <NotificationContext.Provider value={{ 
      hasUnreadNotifications, 
      updateNotificationStatus,
      checkUnreadNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext); 