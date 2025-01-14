import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const user = {
    name: 'Erica L. Poche',
    email: 'ericaloveranespoche@gmail.com',
    profileImage: 'https://example.com/profile.jpg', // Replace with actual URL or local asset
    phone: '0909-371-7983',
  };

  return (
    <LinearGradient colors={['#A259B5', '#FFFFFF']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Account Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionHeader}>Account Details</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={24} color="#A259B5" />
            <Text style={styles.detailText}>{user.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={24} color="#A259B5" />
            <Text style={styles.detailText}>{user.phone}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="edit" size={24} color="#fff" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Logout pressed')} // Replace with actual logout logic
          >
            <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.actionText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('HomePage')}
          >
            <MaterialIcons name="home" size={24} color="#A259B5" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={24} color="#A259B5" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A259B5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    marginTop: 5,
    fontSize: 14,
    color: '#A259B5',
  },
});

export default ProfileScreen;
