import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerContent = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require('./assets/images/profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Angelica V.</Text>
        <Text style={styles.profileRole}>User</Text>
      </View>

      {/* Navigation Links */}
      <View style={styles.navSection}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <View style={styles.navItem}>
            <Ionicons name="ios-home" size={24} color="#8146C1" />
            <Text style={styles.navText}>Home</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('PetProfiles')}>
          <View style={styles.navItem}>
            <Ionicons name="ios-paw" size={24} color="#8146C1" />
            <Text style={styles.navText}>Pet Profiles</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Appointment')}>
          <View style={styles.navItem}>
            <Ionicons name="ios-calendar" size={24} color="#8146C1" />
            <Text style={styles.navText}>Appointment</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('HealthRecords')}>
          <View style={styles.navItem}>
            <Ionicons name="ios-folder" size={24} color="#8146C1" />
            <Text style={styles.navText}>Health Records</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
          <View style={styles.navItem}>
            <Ionicons name="ios-alarm" size={24} color="#8146C1" />
            <Text style={styles.navText}>Reminders</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Help')}>
          <View style={styles.navItem}>
            <Ionicons name="ios-help-circle" size={24} color="#8146C1" />
            <Text style={styles.navText}>Help</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <TouchableOpacity onPress={() => alert('Logged out')}>
        <View style={styles.logoutSection}>
          <Ionicons name="ios-exit" size={24} color="#8146C1" />
          <Text style={styles.navText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8146C1',
  },
  profileRole: {
    fontSize: 14,
    color: '#888888',
  },
  navSection: {
    flex: 1,
    marginTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  navText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#8146C1',
  },
  logoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
});

export default CustomDrawerContent;
