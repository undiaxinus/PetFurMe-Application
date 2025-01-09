import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomePage = ({ navigation }) => {
  const [search, setSearch] = useState('');

  return (
    <LinearGradient colors={['#A259B5', '#FFFFFF']} style={styles.gradientContainer}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Welcome to {'\n'} PetFurMe!</Text>
          <TouchableOpacity 
            style={styles.accountCircle} 
            onPress={() => navigation.navigate('Profile')}>
            <MaterialIcons name="account-circle" size={40} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search for pets or products..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Featured Products Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionHeader}>Products Available Here</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Image
              style={styles.featuredImage}
              source={{ uri: 'https://example.com/product1.jpg' }} // Replace with actual image
            />
            <Image
              style={styles.featuredImage}
              source={{ uri: 'https://example.com/product2.jpg' }} // Replace with actual image
            />
            <Image
              style={styles.featuredImage}
              source={{ uri: 'https://example.com/product3.jpg' }} // Replace with actual image
            />
          </ScrollView>
        </View>

        {/* Animal Categories Section */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionHeader}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Dogs', 'Cats', 'Birds', 'Fish', 'Reptiles', 'Small Pets'].map((category) => (
              <TouchableOpacity 
                key={category} 
                style={styles.categoryItem} 
                onPress={() => console.log(`Go to ${category}`)}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Pets Section */}
        <View style={styles.popularPetsSection}>
          <Text style={styles.sectionHeader}>Popular Pets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[{ name: 'Dog', uri: 'https://example.com/dog.jpg' }, { name: 'Cat', uri: 'https://example.com/cat.jpg' }, { name: 'Bird', uri: 'https://example.com/bird.jpg' }].map((pet) => (
              <View key={pet.name} style={styles.petItem}>
                <Image style={styles.petImage} source={{ uri: pet.uri }} />
                <Text style={styles.petName}>{pet.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {[
            { name: 'Home', icon: 'home', screen: 'Home' },
            { name: 'Notifications', icon: 'notifications', screen: 'Notification' },
            { name: 'Chat', icon: 'chat', screen: 'Chat' },
            { name: 'Profile', icon: 'account-circle', screen: 'Profile' },
          ].map((navItem) => (
            <TouchableOpacity 
              key={navItem.name} 
              style={styles.navItem} 
              onPress={() => navigation.navigate(navItem.screen)}>
              <MaterialIcons name={navItem.icon} size={30} color="#333" />
              <Text style={styles.navText}>{navItem.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  accountCircle: {
    marginRight: -20,
    width: 60, 
    height: 60, 
  },

  searchBar: {
    height: 40,
    borderRadius: 20,
    paddingLeft: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featuredImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryItem: {
    padding: 10,
    backgroundColor: '#A259B5',
    borderRadius: 10,
    marginRight: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
  },
  popularPetsSection: {
    marginBottom: 20,
  },
  petItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  petName: {
    marginTop: 5,
    fontSize: 16,
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15, // Increase padding
    backgroundColor: '#A259B5', // More vibrant background
    borderTopLeftRadius: 5, // Add rounded corners
    borderTopRightRadius: 5,
    elevation: 5, // Shadow effect (Android)
    shadowColor: '#000', // Shadow effect (iOS)
    shadowOffset: { width: 5, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: -10,
    width: 350,
    left: -15,
    height: 50,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 14, // Slightly larger font size
    color: '#fff', // White color for better contrast
    fontWeight: 'bold', // Make text bold
    marginTop: 5, // Add spacing between icon and text
  },

});

export default HomePage;
