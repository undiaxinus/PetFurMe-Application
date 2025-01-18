import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" top={15}/>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Stay Updated</Text>
        </View>
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications available.</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
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
    marginLeft: 16,
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
});

export default NotificationScreen;