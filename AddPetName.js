import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddPetProfile = ({ navigation }) => {
  const [petName, setPetName] = useState('');

  const handleContinue = () => {
    if (petName.trim() === '') {
      alert('Please enter your pet\'s name.');
    } else {
      navigation.navigate('NextStep'); // Replace 'NextStep' with your next screen
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            
            style={styles.backButton}
             // Adjust arrow position here
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#808080" // Changed to gray
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Pet Profile</Text>
          <Text style={styles.name}>Name</Text>
          <Text style={styles.headerStep}>Step 3/5</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
      </View>

      {/* Pet Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imageCircle}>
          <Image
            source={require('./assets/images/dogg.png')} // Replace with your image path
            style={styles.petImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pet Name Input */}
      <Text style={styles.label}>What’s your pet’s name?</Text>
      <TextInput
        style={styles.input}
        placeholder="Your pet’s name"
        value={petName}
        onChangeText={setPetName}
        placeholderTextColor="#8146C1"
      />

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, !petName.trim() && { backgroundColor: '#D52FFF' }]}
        onPress={handleContinue}
        disabled={!petName.trim()}
      >
        <Text style={styles.continueButtonText} onPress={() => navigation.navigate('AddPetSize')}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    width: 360,
    alignItems: 'center',
    marginBottom: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8146C1',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 14,
    top: -25,
  },
  backButton: {
    position: 'absolute',
    left: 10, // Adjust horizontal position
    top: 60,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    top: 42,
    left: 105,
  },
  headerStep: {
    color: '#808080',
    fontSize: 14,
    top: 65,
    left: 15,
  },
  progressBarContainer: {
    backgroundColor: '#E0E0E0',
    height: 4,
    width: '90%',
    marginVertical: 10,
    top: 30,
  },
  progressBar: {
    backgroundColor: '#8146C1',
    width: '60%', // Adjust width based on step progress
    height: '100%',
  },
  name: {
    color: '#bfbfbf',
    fontSize: 14,
    fontWeight: 'bold',
    top: 65,
    left: -30,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    top: -110,
  },
  imageCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#D1ACDA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  petImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FF3DE0',
    borderRadius: 20,
    padding: 8,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
    fontWeight: 'bold',
    top: -80,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    color: '#bfbfbf',
    top: -70,
  },
  continueButton: {
    width: '90%',
    backgroundColor: '#8146C1',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPetProfile;
