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

const Profile3 = ({ navigation }) => {
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
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Add Pet Profile</Text>
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
      />

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, !petName.trim() && { backgroundColor: '#E0E0E0' }]}
        onPress={handleContinue}
        disabled={!petName.trim()}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8146C1',
    width: '400',
    paddingHorizontal: 20,
    paddingVertical: 15,
    top: -120,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerStep: {
    color: '#FFFFFF',
    fontSize: 14,
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
    width: '60%', // Adjust width based on step progress
    height: '100%',
    borderRadius: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#D1ACDA',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  continueButton: {
    width: '90%',
    backgroundColor: '#8146C1',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile3;
