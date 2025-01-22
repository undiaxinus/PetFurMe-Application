import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';

const AddAppointment = ({ route, navigation }) => {
  const { reason, user_id } = route.params || {}; // Get both reason and user_id from params
  const [owner_name, setOwnerName] = useState('');
  const [reason_for_visit, setReason] = useState(reason || ''); // Initialize with the passed reason
  const [custom_reason, setCustomReason] = useState(''); // Add this line
  const [appointment_date, setDate] = useState('');
  const [appointment_time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);

  useEffect(() => {
    if (reason) {
      setReason(reason); // Set the reason if passed as a parameter
    }
  }, [reason]);

  useEffect(() => {
    if (user_id) {
      fetchUserPets();
    }
  }, [user_id]);

  const fetchUserPets = async () => {
    try {
      console.log("Fetching pets for user_id:", user_id); // Debug log
      const response = await fetch(`http://${SERVER_IP}/PetFurMe-Application/api/pets/get_user_pets.php?user_id=${user_id}`);
      const result = await response.json();
      
      console.log("API Response:", result); // Debug log
      
      if (result.success) {
        setPets(result.pets);
      } else {
        console.error('Failed to fetch pets:', result.message);
        Alert.alert('Error', 'Failed to fetch pets. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      Alert.alert('Error', 'Unable to connect to the server.');
    }
  };

  const handleSaveAppointment = async () => {
    if (
      owner_name.trim() &&
      (reason_for_visit === 'Other' ? custom_reason.trim() : reason_for_visit) &&
      appointment_date.trim() &&
      appointment_time.trim() &&
      selectedPet
    ) {
      if (!user_id) {
        Alert.alert('Error', 'User ID is missing. Please login again.');
        return;
      }

      // Get the selected pet's name
      const selectedPetDetails = pets.find(p => p.id === selectedPet);
      if (!selectedPetDetails) {
        Alert.alert('Error', 'Selected pet not found');
        return;
      }

      setLoading(true);
      try {
        const appointmentData = {
          user_id: user_id,
          pet_id: selectedPet,
          pet_name: selectedPetDetails.name, // Add pet name to the data
          owner_name: owner_name.trim(),
          reason_for_visit: reason_for_visit,
          other_reason: reason_for_visit === 'Other' ? custom_reason.trim() : null,
          appointment_date: appointment_date.trim(),
          appointment_time: appointment_time.trim(),
        };

        console.log('Sending appointment data:', appointmentData); // Debug log

        const response = await fetch(`http://${SERVER_IP}/PetFurMe-Application/api/appointments/save.php`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        });

        const result = await response.json();
        console.log('API Response:', result); // Debug log

        if (result.success) {
          Alert.alert('Success', 'Appointment saved successfully');
          navigation.goBack();
        } else {
          Alert.alert('Error', result.message || 'Failed to save appointment');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'Unable to connect to the server. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Validation Error', 'Please fill out all fields including selecting a pet.');
    }
  };

  // Format the date for display
  const getFormattedDate = () => {
    if (appointment_date) {
      return moment(appointment_date).format('MMMM DD, YYYY');
    }
    return '';
  };

  // Format the time for display
  const getFormattedTime = () => {
    if (appointment_time) {
      return moment(appointment_time, 'HH:mm').format('hh:mm A');
    }
    return '';
  };

  // Handle date selection
  const checkAvailability = async (date) => {
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await fetch(
        `http://${SERVER_IP}/PetFurMe-Application/api/appointments/check_availability.php?date=${formattedDate}`
      );
      const result = await response.json();
      
      if (result.success) {
        setAvailableSlots(result.available_slots);
        return result.is_available;
      } else {
        console.error('Failed to check availability:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const onDateChange = async (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const isAvailable = await checkAvailability(selectedDate);
      if (isAvailable) {
        setDate(moment(selectedDate).format('YYYY-MM-DD'));
      } else {
        Alert.alert(
          'Date Unavailable',
          'This date is fully booked. Please select another date.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Handle time selection
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(moment(selectedTime).format('HH:mm'));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Appointment</Text>
      </View>

      {/* Wrap the form in ScrollView */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Fill out the form</Text>

          {/* Owner Name Input with Icon */}
          <Text style={styles.inputLabel}>Owner Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666666" />
            <TextInput
              style={styles.inputWithIcon}
              value={owner_name}
              onChangeText={setOwnerName}
              placeholderTextColor="#b3b3b3"
              placeholder="Enter owner name"
            />
          </View>

          {/* Pet Selection with Icon */}
          <Text style={styles.inputLabel}>Select Your Pet</Text>
          <View style={styles.pickerContainerWithIcon}>
            <Ionicons name="paw-outline" size={20} color="#666666" style={styles.pickerIcon} />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPet}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  setSelectedPet(itemValue);
                  console.log("Selected pet:", pets.find(p => p.id === itemValue));
                }}
              >
                <Picker.Item label="Select a pet" value={null} />
                {pets.map(pet => (
                  <Picker.Item 
                    key={pet.id} 
                    label={pet.name} 
                    value={pet.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Show selected pet details only if a pet is selected */}
          {selectedPet && (
            <View style={styles.selectedPetDetails}>
              {(() => {
                const pet = pets.find(p => p.id === selectedPet);
                if (!pet) return null;
                
                return (
                  <>
                    <Text style={styles.petDetailText}>Type: {pet.type || 'N/A'}</Text>
                    <Text style={styles.petDetailText}>Breed: {pet.breed || 'N/A'}</Text>
                    <Text style={styles.petDetailText}>Age: {pet.age || 'N/A'}</Text>
                    <Text style={styles.petDetailText}>Gender: {pet.gender || 'N/A'}</Text>
                    {pet.weight && <Text style={styles.petDetailText}>Weight: {pet.weight} kg</Text>}
                    {pet.size && <Text style={styles.petDetailText}>Size: {pet.size}</Text>}
                  </>
                );
              })()}
            </View>
          )}

          {/* Reason for Visit Input */}
          <Text style={styles.inputLabel}>Reason for Visit</Text>
          <View style={styles.reasonButtonsContainer}>
            {['Consultation', 'Vaccination', 'Deworming', 'Grooming', 'Other'].map((reasonOption) => (
              <TouchableOpacity
                key={reasonOption}
                style={[
                  styles.reasonButton,
                  reason_for_visit === reasonOption && styles.selectedReasonButton,
                ]}
                onPress={() => setReason(reasonOption)}
              >
                <Text
                  style={[
                    styles.reasonButtonText,
                    reason_for_visit === reasonOption && styles.selectedReasonButtonText,
                  ]}
                >
                  {reasonOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add custom reason input field */}
          {reason_for_visit === 'Other' && (
            <TextInput
              style={[styles.input, styles.customReasonInput]}
              value={custom_reason}
              onChangeText={setCustomReason}
              placeholder="Please specify your reason"
              placeholderTextColor="#b3b3b3"
              multiline
            />
          )}

          {/* Date Picker with Icon */}
          <Text style={styles.inputLabel}>Appointment Date</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.datePickerContent}>
              <View style={styles.datePickerRow}>
                <Ionicons name="calendar-outline" size={20} color="#666666" />
                <Text style={[styles.datePickerText, { marginLeft: 10 }]}>
                  {getFormattedDate() || 'Select Date'}
                </Text>
              </View>
              {appointment_date && availableSlots !== null && (
                <Text style={styles.availableSlotsText}>
                  <Ionicons name="time-outline" size={14} color="#666666" />
                  {' '}{availableSlots} slots available
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down-outline" size={20} color="#CC38F2" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={appointment_date ? new Date(appointment_date) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time Picker with Icon */}
          <Text style={styles.inputLabel}>Appointment Time</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.datePickerRow}>
              <Ionicons name="time-outline" size={20} color="#666666" />
              <Text style={[styles.datePickerText, { marginLeft: 10 }]}>
                {getFormattedTime() || 'Select Time'}
              </Text>
            </View>
            <Ionicons name="chevron-down-outline" size={20} color="#CC38F2" />
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={appointment_time ? moment(appointment_time, 'HH:mm').toDate() : new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>
      </ScrollView>

      {/* Save Button with Icon */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAppointment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.saveButtonContent}>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>
                Save Appointment
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
				left: 60,
  },
  formContainer: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind button
  },
  formLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
    top: -10,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#CC38F2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reasonButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reasonButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedReasonButton: {
    backgroundColor: '#CC38F2',
  },
  reasonButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedReasonButtonText: {
    color: '#FFFFFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  datePickerText: {
    fontSize: 14,
    color: '#000000',
  },
  customReasonInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
    marginTop: -10,
    marginBottom: 15,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  petSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  petSelectText: {
    fontSize: 14,
    color: '#000000',
  },
  selectedPetDetails: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  petDetailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden', // This helps maintain the border radius
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#000000',
  },
  datePickerContent: {
    flex: 1,
  },
  availableSlotsText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  inputWithIcon: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000000',
  },
  pickerContainerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  pickerIcon: {
    paddingLeft: 12,
  },
  pickerWrapper: {
    flex: 1,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddAppointment;
