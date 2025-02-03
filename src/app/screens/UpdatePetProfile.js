import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CustomDropdown from '../components/CustomDropdown';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
// Constants for dropdown options
const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Others'];
const PET_SIZES = ['Small', 'Medium', 'Large'];
const PET_GENDERS = ['Male', 'Female'];

// Add this constant at the top of the file with other imports
const API_BASE_URL = `http://${SERVER_IP}`;

const UpdatePetProfile = ({ navigation, route }) => {
  const { pet_id, user_id } = route.params;  // Make sure user_id is passed in route.params
  console.log("Route params:", route.params);
  console.log("Pet ID:", route.params?.pet_id);
  console.log("User ID:", route.params?.user_id);

  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petAllergies, setPetAllergies] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [petGender, setPetGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  // Add useEffect to fetch pet data when component mounts
  useEffect(() => {
    if (!user_id) {
      Alert.alert(
        'Error',
        'User ID is missing. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      return;
    }

    fetchPetData();
  }, [user_id]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry', 'We need camera roll permissions to upload photos.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
        const formData = new FormData();
        
        // Add photo if selected
        if (photo?.uri && !photo.uri.startsWith('data:image')) {
            const localUri = photo.uri;
            const filename = localUri.split('/').pop();
            
            formData.append('photo', {
                uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                type: 'image/jpeg',
                name: filename || 'pet_photo.jpg'
            });
        }

        // Add pet data
        const petData = {
            pet_id: pet_id,
            user_id: user_id,  // Make sure user_id is included
            name: petName.trim(),
            age: petAge ? parseInt(petAge) : null,
            type: petType.toLowerCase(),
            breed: petBreed.trim(),
            gender: petGender.toLowerCase(),
            weight: petWeight ? parseFloat(petWeight) : null,
            size: petSize.toLowerCase(),
            allergies: petAllergies.trim(),
            notes: petNotes.trim()
        };

        console.log('Sending pet data:', petData);
        formData.append('data', JSON.stringify(petData));

        const response = await fetch(
            `${API_BASE_URL}/PetFurMe-Application/api/pets/update_pet.php`,
            {
                method: 'POST',
                body: formData
            }
        );

        const result = await response.json();

        if (result.success) {
            // Log activity only after successful update
            await logActivity(
                ACTIVITY_TYPES.PET_UPDATED,
                user_id,
                {
                    name: petName.trim(),
                    updatedFields: Object.entries({
                        name: petName.trim(),
                        age: petAge,
                        type: petType,
                        breed: petBreed,
                        gender: petGender,
                        weight: petWeight,
                        size: petSize,
                        allergies: petAllergies,
                        notes: petNotes,
                        photo: photo ? 'photo' : null
                    })
                    .filter(([_, value]) => value)
                    .map(([key]) => key)
                }
            );

            Alert.alert('Success', 'Pet profile updated successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        if (route.params?.onComplete) {
                            route.params.onComplete();
                        }
                        navigation.goBack();
                    }
                }
            ]);
        } else {
            throw new Error(result.message || 'Failed to update pet profile');
        }
    } catch (error) {
        console.error('Error updating pet profile:', error);
        Alert.alert('Error', 'Failed to update pet profile: ' + error.message);
    } finally {
        setLoading(false);
    }
};

  const fetchPetData = async () => {
    if (!pet_id) {
      Alert.alert('Error', 'Pet ID is missing');
      return;
    }

    setLoading(true);
    try {
      // First, get all pets for the user
      const url = `${API_BASE_URL}/PetFurMe-Application/api/pets/get_user_pets.php?user_id=${user_id}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch pet details');
      }

      const data = await response.json();
      console.log('All pets data:', data);

      if (data.success && data.pets) {
        // Find the specific pet we want to edit
        const petData = data.pets.find(pet => pet.id === parseInt(pet_id));
        console.log('Found pet data:', petData);

        if (petData) {
          // Set all the pet data
          setPetName(petData.name || '');
          setPetAge(petData.age?.toString() || '');
          setPetType(petData.type ? petData.type.charAt(0).toUpperCase() + petData.type.slice(1) : '');
          setPetBreed(petData.breed || '');
          setPetSize(petData.size ? petData.size.charAt(0).toUpperCase() + petData.size.slice(1) : '');
          setPetWeight(petData.weight?.toString() || '');
          setPetGender(petData.gender ? petData.gender.charAt(0).toUpperCase() + petData.gender.slice(1) : '');
          
          // Handle allergies and notes
          console.log('Setting allergies:', petData.allergies);
          console.log('Setting notes:', petData.notes);
          
          setPetAllergies(petData.allergies || '');
          setPetNotes(petData.notes || '');

          // Handle photo
          if (petData.photo) {
            setPhoto(petData.photo);
          }
        } else {
          throw new Error('Pet not found in user\'s pets');
        }
      } else {
        throw new Error(data.message || 'Failed to load pets data');
      }
    } catch (error) {
      console.error('Error in fetchPetData:', error);
      Alert.alert('Error', 'Failed to fetch pet data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8146C1" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Pet Profile</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.formContainer}>
          {/* Pet Image */}
          <View style={styles.imageContainer}>
            <View style={styles.imageCircle}>
              <Image
                source={photo ? { uri: photo } : require("../../assets/images/doprof.png")}
                style={styles.petImage}
              />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Required Fields Section */}
          <Text style={styles.sectionTitle}>Required Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pet's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pet's name"
              value={petName}
              onChangeText={setPetName}
              placeholderTextColor="#8146C1"
            />
          </View>

          {/* Age and Weight Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                value={petAge}
                onChangeText={setPetAge}
                placeholderTextColor="#8146C1"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight"
                value={petWeight}
                onChangeText={setPetWeight}
                placeholderTextColor="#8146C1"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Type and Size Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Type</Text>
              <CustomDropdown
                label="Select Pet Type"
                options={PET_TYPES}
                value={petType}
                onSelect={setPetType}
                placeholder="Select type"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Size</Text>
              <CustomDropdown
                label="Select Pet Size"
                options={PET_SIZES}
                value={petSize}
                onSelect={setPetSize}
                placeholder="Select size"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter breed"
              value={petBreed}
              onChangeText={setPetBreed}
              placeholderTextColor="#8146C1"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <CustomDropdown
              label="Select Pet Gender"
              options={PET_GENDERS}
              value={petGender}
              onSelect={setPetGender}
              placeholder="Select gender"
            />
          </View>

          {/* Optional Fields Section */}
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergies (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List any allergies"
              value={petAllergies}
              onChangeText={setPetAllergies}
              placeholderTextColor="#8146C1"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes"
              value={petNotes}
              onChangeText={setPetNotes}
              placeholderTextColor="#8146C1"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity 
            style={styles.updateButton}
            onPress={handleUpdate}
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  header: {
    backgroundColor: '#8146C1',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1D9F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8146C1',
    padding: 8,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8146C1',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#8146C1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UpdatePetProfile; 