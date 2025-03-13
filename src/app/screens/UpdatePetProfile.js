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
import CustomHeader from '../components/CustomHeader';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
// Constants for dropdown options
const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Others'];
const PET_SIZES = ['Small', 'Medium', 'Large'];
const PET_GENDERS = ['Male', 'Female'];

// Add this constant at the top of the file with other imports
const API_BASE_URL = `http://${SERVER_IP}`;

const UpdatePetProfile = ({ navigation, route }) => {
  const { pet, user_id } = route.params;
  
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('Not Specified');
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState('');
  const [petWeight, setPetWeight] = useState('Not Specified');
  const [petAllergies, setPetAllergies] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [petGender, setPetGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [ageUnit, setAgeUnit] = useState('years');
  const [previousAge, setPreviousAge] = useState('');
  const [previousWeight, setPreviousWeight] = useState('');
  const [previousBreed, setPreviousBreed] = useState('');
  const [isAgeFocused, setIsAgeFocused] = useState(false);
  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [isBreedFocused, setIsBreedFocused] = useState(false);

  useEffect(() => {
    if (!pet || !user_id) {
      Alert.alert(
        "Error",
        "Missing required information",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    // Populate form with existing pet data
    setPetName(pet.name || '');
    setPetAge(pet.age?.toString() || '');
    setPetType(pet.type || '');
    setPetBreed(pet.breed || '');
    setPetWeight(pet.weight?.toString() || '');
    setPetAllergies(pet.allergies || '');
    setPetNotes(pet.notes || '');
    setPetGender(pet.gender || '');
    setAgeUnit(pet.age_unit || 'years');
    
    // Handle existing photo
    if (pet.photo) {
      console.log('Setting initial photo:', {
        hasPhoto: true,
        photoLength: pet.photo.length,
        preview: pet.photo.substring(0, 50) + '...'
      });
      
      setPhoto({
        uri: `data:image/jpeg;base64,${pet.photo}`,
        base64: pet.photo,
        exists: true
      });
    }
  }, [pet]);

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
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setPhoto({
          uri: asset.uri,
          base64: asset.base64,
          type: 'image/jpeg',
          isNew: true
        });
        console.log('New photo selected:', {
          hasUri: !!asset.uri,
          hasBase64: !!asset.base64
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSkipAge = () => {
    if (petAge === 'Not Specified') {
        setPetAge(previousAge);
    } else {
        setPreviousAge(petAge);
        setPetAge('Not Specified');
    }
  };

  const handleSkipWeight = () => {
    if (petWeight === 'Not Specified') {
        setPetWeight(previousWeight);
    } else {
        setPreviousWeight(petWeight);
        setPetWeight('Not Specified');
    }
  };

  const handleSkipBreed = () => {
    if (petBreed === 'Not Specified') {
        setPetBreed(previousBreed);
    } else {
        setPreviousBreed(petBreed);
        setPetBreed('Not Specified');
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Handle photo as binary data - match AddPetName.js approach
      if (photo) {
        try {
          if (photo.base64) {
            // Directly append base64 data
            formData.append('photo', photo.base64);
            formData.append('is_base64', 'true');
          } else if (photo.uri) {
            // For URI, convert to base64
            const response = await fetch(photo.uri);
            const blob = await response.blob();
            const reader = new FileReader();
            
            const base64Data = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result.split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            
            formData.append('photo', base64Data);
            formData.append('is_base64', 'true');
          }
        } catch (error) {
          console.error('Error processing photo:', error);
          Alert.alert('Error', 'Failed to process photo. Please try again.');
          return;
        }
      }

      // Add pet data
      const petData = {
        pet_id: pet.id,
        user_id: parseInt(user_id),
        name: petName.trim(),
        age: petAge !== 'Not Specified' ? parseInt(petAge) : null,
        type: petType.toLowerCase(),
        breed: petBreed !== 'Not Specified' ? petBreed.trim() : null,
        gender: petGender.toLowerCase(),
        weight: petWeight !== 'Not Specified' ? parseFloat(petWeight) : null,
        size: petSize.toLowerCase(),
        allergies: petAllergies.trim() || null,
        notes: petNotes.trim() || null
      };

      formData.append('data', JSON.stringify(petData));

      // Debug log
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value.substring(0, 100)}...`);
      }

      const response = await fetch(
        `${API_BASE_URL}/PetFurMe-Application/api/pets/update_pet.php`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse server response:', error);
        console.error('Response text:', responseText);
        throw new Error('Invalid server response');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to update pet profile');
      }

      // Success handling...
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'DrawerNavigator',
            params: {
              screen: 'HomePage',
              params: {
                user_id: user_id,
                refresh: true,
                showMessage: true,
                message: 'Pet profile updated successfully!',
                messageType: 'success'
              }
            }
          }
        ]
      });

    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert(
        "Error", 
        error.message || "Failed to update pet profile. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Pet Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Photo Upload Box */}
        <View style={styles.photoBox}>
          <View style={styles.photoCircle}>
            <Image 
              source={
                photo ? 
                (typeof photo === 'string' ? { uri: photo } : photo) : 
                require("../../assets/images/doprof.png")
              }
              style={styles.petImage}
            />
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.addPhotoText}>Add Pet Photo</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="paw" size={20} color="#8146C1" />
            <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              petName.trim() && styles.inputContainerWithValue
            ]}>
              <View style={styles.iconContainer}>
                <Ionicons name="paw" size={20} color="#8146C1" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your pet's name"
                value={petName}
                onChangeText={setPetName}
                placeholderTextColor="#A3A3A3"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <CustomDropdown
                label="Pet Type"
                options={PET_TYPES}
                value={petType}
                onSelect={setPetType}
                placeholder="Choose type"
                headerText={petType || ''}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomDropdown
                label="Gender"
                options={PET_GENDERS}
                value={petGender}
                onSelect={setPetGender}
                placeholder="Choose gender"
                headerText={petGender || ''}
            />
          </View>

          {/* Additional Information */}
          <View style={styles.additionalInfoContainer}>
            <Text style={styles.additionalInfoHeader}>Additional Information</Text>

            {/* Age Field */}
            <View style={styles.optionalField}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Age</Text>
                <View style={styles.inputWithAction}>
                  <TextInput
                    style={[
                      styles.optionalInput,
                      petAge !== 'Not Specified' && petAge !== '' && styles.optionalInputWithValue,
                      petAge === 'Not Specified' && styles.skippedInput
                    ]}
                    placeholder={isAgeFocused || petAge !== 'Not Specified' ? '' : 'None'}
                    value={petAge === 'Not Specified' || !petAge ? 'None' : petAge}
                    onFocus={() => setIsAgeFocused(true)}
                    onBlur={() => setIsAgeFocused(false)}
                    onChangeText={(text) => {
                      if (text.trim() === '' || text === 'None') {
                        setPetAge('Not Specified');
                      } else {
                        setPetAge(text);
                      }
                    }}
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                    editable={petAge !== 'Not Specified'}
                  />
                  <TouchableOpacity 
                    style={[styles.skipButton, petAge === 'Not Specified' && styles.skipButtonActive]}
                    onPress={handleSkipAge}
                    disabled={false}
                  >
                    <Text style={[styles.skipButtonText, petAge === 'Not Specified' && styles.activeButtonText]}>
                      {petAge === 'Not Specified' ? 'Undo' : 'Skip'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Weight Field */}
            <View style={styles.optionalField}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Weight (kg)</Text>
                <View style={styles.inputWithAction}>
                  <TextInput
                    style={[
                      styles.optionalInput,
                      petWeight !== 'Not Specified' && petWeight !== '' && styles.optionalInputWithValue,
                      petWeight === 'Not Specified' && styles.skippedInput
                    ]}
                    placeholder={isWeightFocused || petWeight !== 'Not Specified' ? '' : 'None'}
                    value={petWeight === 'Not Specified' || !petWeight ? 'None' : petWeight}
                    onFocus={() => setIsWeightFocused(true)}
                    onBlur={() => setIsWeightFocused(false)}
                    onChangeText={(text) => {
                      if (text.trim() === '' || text === 'None') {
                        setPetWeight('Not Specified');
                      } else {
                        setPetWeight(text);
                      }
                    }}
                    placeholderTextColor="#A3A3A3"
                    keyboardType="decimal-pad"
                    editable={petWeight !== 'Not Specified'}
                  />
                  <TouchableOpacity 
                    style={[styles.skipButton, petWeight === 'Not Specified' && styles.skipButtonActive]}
                    onPress={handleSkipWeight}
                    disabled={false}
                  >
                    <Text style={[styles.skipButtonText, petWeight === 'Not Specified' && styles.activeButtonText]}>
                      {petWeight === 'Not Specified' ? 'Undo' : 'Skip'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Breed Field */}
            <View style={styles.optionalField}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Breed</Text>
                <View style={styles.inputWithAction}>
                  <TextInput
                    style={[
                      styles.optionalInput,
                      petBreed !== 'Not Specified' && petBreed !== '' && styles.optionalInputWithValue,
                      petBreed === 'Not Specified' && styles.skippedInput
                    ]}
                    placeholder={isBreedFocused || petBreed !== 'Not Specified' ? '' : 'None'}
                    value={petBreed === 'Not Specified' || !petBreed ? 'None' : petBreed}
                    onFocus={() => setIsBreedFocused(true)}
                    onBlur={() => setIsBreedFocused(false)}
                    onChangeText={(text) => {
                      if (text.trim() === '' || text === 'None') {
                        setPetBreed('Not Specified');
                      } else {
                        setPetBreed(text);
                      }
                    }}
                    placeholderTextColor="#A3A3A3"
                    editable={petBreed !== 'Not Specified'}
                  />
                  <TouchableOpacity 
                    style={[styles.skipButton, petBreed === 'Not Specified' && styles.skipButtonActive]}
                    onPress={handleSkipBreed}
                    disabled={false}
                  >
                    <Text style={[styles.skipButtonText, petBreed === 'Not Specified' && styles.activeButtonText]}>
                      {petBreed === 'Not Specified' ? 'Undo' : 'Skip'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Health Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#8146C1" />
            <Text style={styles.sectionTitle}>HEALTH INFORMATION</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                petAllergies.trim() && styles.textAreaWithValue
              ]}
              placeholder="List any known allergies (if any)"
              value={petAllergies || 'None'}
              onChangeText={setPetAllergies}
              placeholderTextColor="#A3A3A3"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Special Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                petNotes.trim() && styles.textAreaWithValue
              ]}
              placeholder="Add any special care instructions"
              value={petNotes || 'None'}
              onChangeText={setPetNotes}
              placeholderTextColor="#A3A3A3"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUpdate}
        >
          <Text style={styles.saveButtonText}>Save Pet Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8146C1" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#8146C1',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  photoBox: {
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  photoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8146C1',
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    resizeMode: 'cover',
  },
  addButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#8146C1',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  addPhotoText: {
    color: '#8146C1',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#8146C1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  additionalInfoContainer: {
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  additionalInfoHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8146C1',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  optionalField: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
  },
  fieldWrapper: {
    gap: 8,
  },
  inputWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  inputContainerWithValue: {
    borderColor: '#8146C1',
    borderWidth: 2,
  },
  iconContainer: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  optionalInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    color: "#2D3748",
    fontSize: 13,
  },
  optionalInputWithValue: {
    borderColor: '#8146C1',
    borderWidth: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  textAreaWithValue: {
    borderColor: '#8146C1',
    borderWidth: 2,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F5FF',
    borderWidth: 1,
    borderColor: '#E9E3F5',
    minWidth: 70,
    alignItems: 'center'
  },
  skipButtonText: {
    color: '#8146C1',
    fontSize: 12,
    fontWeight: '500'
  },
  activeButtonText: {
    color: '#666666'
  },
  skipButtonActive: {
    backgroundColor: '#E9E3F5',
    borderColor: '#D1C4E9'
  },
  skippedInput: {
    backgroundColor: '#F5F5F5',
    color: '#666666',
    fontStyle: 'italic'
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  required: {
    color: '#8146C1',
  },
  saveButton: {
    backgroundColor: '#8146C1',
    margin: 16,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpdatePetProfile; 