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
  const [ageUnit, setAgeUnit] = useState('years');

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Pet Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Photo Upload Box */}
        <View style={styles.photoBox}>
          <View style={styles.photoCircle}>
            <Image 
              source={require('../../assets/images/doprof.png')}
              style={styles.pawIcon}
            />
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.addPhotoText}>Add Pet Photo</Text>
        </View>

        {/* Basic Information Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="paw" size={20} color="#8146C1" />
            <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrapper}>
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
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age <Text style={styles.required}>*</Text></Text>
            <View style={styles.ageInputContainer}>
              <TextInput
                style={styles.ageInput}
                placeholder="Age"
                value={petAge}
                onChangeText={setPetAge}
                keyboardType="numeric"
              />
              <View style={styles.ageToggle}>
                <TouchableOpacity 
                  style={[styles.ageToggleButton, ageUnit === 'years' && styles.activeToggle]}
                  onPress={() => setAgeUnit('years')}
                >
                  <Text style={[styles.toggleText, ageUnit === 'years' && styles.activeToggleText]}>Yrs</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.ageToggleButton, ageUnit === 'months' && styles.activeToggle]}
                  onPress={() => setAgeUnit('months')}
                >
                  <Text style={[styles.toggleText, ageUnit === 'months' && styles.activeToggleText]}>Mos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="scale" size={20} color="#8146C1" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Optional"
                    value={petWeight}
                    onChangeText={setPetWeight}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#A3A3A3"
                  />
                </View>
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Pet Type</Text>
              <View style={styles.inputWrapper}>
                <CustomDropdown
                  options={PET_TYPES}
                  value={petType}
                  onSelect={setPetType}
                  placeholder="Choose type"
                  containerStyle={styles.dropdownContainer}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <CustomDropdown
              options={PET_GENDERS}
              value={petGender}
              onSelect={setPetGender}
              placeholder="Choose gender"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Breed</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                value={petBreed}
                onChangeText={setPetBreed}
              />
            </View>
          </View>
        </View>

        {/* Health Information Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#8146C1" />
            <Text style={styles.sectionTitle}>HEALTH INFORMATION</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List any known allergies (if any)"
              value={petAllergies}
              onChangeText={setPetAllergies}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Special Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any special care instructions"
              value={petNotes}
              onChangeText={setPetNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUpdate}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
    paddingHorizontal: 16,
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    backgroundColor: '#F8F5FF',
    borderRadius: 8,
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 48,
  },
  iconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  ageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    flex: 1,
    maxWidth: '60%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingLeft: 48,
    fontSize: 16,
    color: '#333333',
  },
  ageToggle: {
    backgroundColor: '#F8F5FF',
    borderRadius: 8,
    padding: 2,
    flexDirection: 'row',
  },
  ageToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#8146C1',
  },
  toggleText: {
    fontSize: 14,
    color: '#8146C1',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: '#8146C1',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
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
  required: {
    color: '#8146C1',
  },
});

export default UpdatePetProfile; 