import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import for the account circle icon

const HomePage = ({ navigation }) => {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome to {'\n'} Pet Fur Me!</Text>
        <TouchableOpacity 
          style={styles.accountCircle} 
          onPress={() => navigation.navigate('Profile')} // Navigate to Profile or Account screen
        >
          <MaterialIcons name="account-circle" size={40} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search here..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Product display rectangle */}
      <View style={styles.productContainer}>
        <Text style={styles.productText}>Products {'\n'}Available Here</Text>
      </View>

      {/* Animal categories section */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryHeader}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          <TouchableOpacity style={styles.categoryItem} onPress={() => console.log('Go to Dogs')}>
            <Text style={styles.categoryText}>Dogs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => console.log('Go to Cats')}>
            <Text style={styles.categoryText}>Cats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => console.log('Go to Birds')}>
            <Text style={styles.categoryText}>Birds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => console.log('Go to Fish')}>
            <Text style={styles.categoryText}>Fish</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => console.log('Go to Reptiles')}>
            <Text style={styles.categoryText}>Reptiles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => console.log('Go to Small Pets')}>
            <Text style={styles.categoryText}>Small Pets</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Pets with images section */}
      <View style={styles.petsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pets}>
          <View style={styles.petItem}>
            <Image
              style={styles.petImage}
              source={{ uri: 'https://example.com/dog.jpg' }} // Replace with actual pet image URL
            />
            <Text style={styles.petName}>Dog</Text>
          </View>
          <View style={styles.petItem}>
            <Image
              style={styles.petImage}
              source={{ uri: 'https://example.com/cat.jpg' }} // Replace with actual pet image URL
            />
            <Text style={styles.petName}>Cat</Text>
          </View>
          <View style={styles.petItem}>
            <Image
              style={styles.petImage}
              source={{ uri: 'https://example.com/bird.jpg' }} // Replace with actual pet image URL
            />
            <Text style={styles.petName}>Bird</Text>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="home" size={30} color="#333" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Notification')}
        >
          <MaterialIcons name="notifications" size={30} color="#333" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Chat')}
        >
          <MaterialIcons name="chat" size={30} color="#333" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
        >
          <MaterialIcons name="account-circle" size={30} color="#333" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  accountCircle: {
    marginRight: 10,
  },
  searchBar: {
    height: 40,
    borderColor: '#99ccff',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  productContainer: {
    marginTop: 20, // Space between the search bar and product container
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#ffccff',
    width: '100%',
    height: '15%',
  },
  productText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10, // Space between product names
  },
  categoryContainer: {
    marginTop: 20, // Space between product container and category section
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  categoryItem: {
    padding: 10,
    backgroundColor: '#99ccff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15, // Space between category items
  },
  categoryText: {
    fontSize: 16,
    color: '#fff',
  },
  petsContainer: {
    marginTop: 30, // Space between category section and pets section
  },
  pets: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  petItem: {
    marginRight: 20, // Space between pet items
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
    paddingVertical: 70,
    backgroundColor: '#f5f5f5',
    borderTopColor: '#ddd',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#333',
  },
});

export default HomePage;

//HomePage
