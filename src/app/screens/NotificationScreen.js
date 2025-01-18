import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Appointment Reminder', description: 'You have an appointment with the vet tomorrow at 10:00 AM.', read: true },
    { id: '2', title: 'New Product Alert', description: 'Check out our new collection of pet accessories.', read: false },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.read ? styles.read : styles.unread]}
      onPress={() => markAsRead(item.id)}
    >
      <MaterialIcons
        name={item.read ? 'notifications-none' : 'notifications-active'}
        size={24}
        color={item.read ? '#aaa' : '#A259B5'}
      />
      <View style={styles.textContainer}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications available.</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 25,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    left: 65,
				top: 10,
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
});

export default NotificationScreen;
