import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Profile2 = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: '1', label: 'DOG', image: require('./assets/images/dogg.png') },
    { id: '2', label: 'CAT', image: require('./assets/images/cat.png') },
    { id: '3', label: 'RABBIT', image: require('./assets/images/rabbit.png') },
    { id: '4', label: 'BIRD', image: require('./assets/images/bird.png') },
  ];

  const handleContinue = () => {
    if (selectedCategory) {
      navigation.navigate('NextScreen'); // Replace 'NextScreen' with your target screen
    } else {
      alert('Please select a pet category.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Category</Text>
          <Text style={styles.breed}>Breed</Text>
          <Text style={styles.headerStep}>Step 2/9</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
      </View>

      {/* Categories */}
      <View style={[styles.categoryBackground, { height: 'auto', paddingVertical: 10 }]}>
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === item.id && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Image source={item.image} style={styles.categoryImage} />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedCategory && { backgroundColor: '#D428FF' },
          ]}
          onPress={handleContinue}
          disabled={!selectedCategory}
        > 
          <Text style={styles.continueButtonText} onPress={() => navigation.navigate('Profile3')}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SkipScreen')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   backgroundColor: '#8146C1',
   width: '400',
   paddingHorizontal: 20,
   paddingVertical: 15,
   top: 35,
  },
  backButton: {
    position: 'absolute',
    left: 30,
    top: 60,
    color: '#000000',
  },
  headerTitle: {
    color: '#0d0d0d',
    fontSize: 18,
    fontWeight: 'bold',
    top: 40,
    left: 130,
  },
  breed: {
   color: '#b3b3b3',
   fontSize: 15,
   fontWeight: 'bold',
   top: 60,
   left: -20,
 },
  headerStep: {
    color: '#808080',
    fontSize: 14,
    top: 65,
    left: -10,
  },
  progressBarContainer: {
    backgroundColor: '#E0E0E0',
    height: 4,
    width: '90%',
    marginVertical: 10,
    borderRadius: 2,
  },
  progressBar: {
    backgroundColor: '#8146C1',
    width: '25%', // Adjust width based on step progress
    height: '100%',
    borderRadius: 2,
    top: 65,
  },
  categoryBackground: {
   flex: 1,
   backgroundColor: '#D1ACDA',
   borderRadius: 5,
   marginHorizontal: 2,
   alignItems: 'center',
   justifyContent: 'center',
   marginVertical: 70,
  },
  categoryList: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItem: {
   width: 150,
   height: 150,
   backgroundColor: '#FFFFFF',
   borderRadius: 10,
   margin: 10,
   alignItems: 'center',
   justifyContent: 'center',
   borderWidth: 2,
   borderColor: '#FFFFFF',
   elevation: 5,
   marginVertical: 30,
  },
  selectedCategory: {
    borderColor: '#8146C1',
  },
  categoryImage: {
    width: 140, // Increased width
    height: 100, // Increased height
    resizeMode: 'contain',
  },
  categoryLabel: {
   marginTop: 10,
   fontSize: 16,
   color: '#FFFFFF',
   fontWeight: 'bold',
   textAlign: 'center',
   backgroundColor: '#FF3DE0',
   borderRadius: 10,
   paddingHorizontal: 10,
   paddingVertical: 5,
   overflow: 'hidden',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButton: {
    width: '90%',
    backgroundColor: '#8146C1',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipText: {
    color: '#b3b3b3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile2;
