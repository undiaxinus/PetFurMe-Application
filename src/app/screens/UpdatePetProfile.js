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
    
    if (pet.photo) {
      setPhoto({
        uri: `http://${SERVER_IP}/PetFurMe-Application/uploads/${pet.photo}`,
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
        pet_id: pet.id,
        user_id: parseInt(user_id),
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
          parseInt(user_id),
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

        // Call onComplete if provided
        if (route.params?.onComplete) {
          route.params.onComplete();
        }

        // Navigate back
        navigation.goBack();
      } else {
        throw new Error(result.message || 'Failed to update pet profile');
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert("Error", `Failed to update pet profile: ${error.message}`);
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
              source={photo ? { uri: photo.uri } : require("../../assets/images/doprof.png")}
              style={styles.pawIcon}
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
            <View style={styles.inputContainer}>
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
            <Text style={styles.label}>Pet Type <Text style={styles.required}>*</Text></Text>
            <CustomDropdown
              options={PET_TYPES}
              value={petType}
              onSelect={setPetType}
              placeholder="Choose type"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
            <CustomDropdown
              options={PET_GENDERS}
              value={petGender}
              onSelect={setPetGender}
              placeholder="Choose gender"
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
                    style={[styles.optionalInput, petAge === 'Not Specified' && styles.skippedInput]}
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
                    style={[styles.optionalInput, petWeight === 'Not Specified' && styles.skippedInput]}
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
                    style={[styles.optionalInput, petBreed === 'Not Specified' && styles.skippedInput]}
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
              style={[styles.input, styles.textArea]}
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
              style={[styles.input, styles.textArea]}
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
  pawIcon: {
    width: 40,
    height: 40,
    tintColor: '#8146C1',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
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