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
import RNPickerSelect from 'react-native-picker-select';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';

const AddAppointment = ({ route, navigation }) => {
  const { reason, user_id } = route.params || {}; // Get both reason and user_id from params
  const [owner_name, setOwnerName] = useState('');
  const [reasons_for_visit, setReasons] = useState([]);
  const [custom_reason, setCustomReason] = useState('');
  const [appointment_date, setDate] = useState('');
  const [appointment_time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [selectedVaccineTypes, setSelectedVaccineTypes] = useState([]);
  const [otherVaccinationType, setOtherVaccinationType] = useState('');
  const [selectedConsultationReasons, setSelectedConsultationReasons] = useState([]);
  const [consultationReason, setConsultationReason] = useState('');

  const VACCINATION_TYPES = [
    'Anti-Rabies',
    'DHPPiL',
    'Bordetella',
    'Deworming',
    'Heartworm Prevention',
    'Other'
  ];

  const CONSULTATION_REASONS = [
    'Complaints',
    'Symptoms',
    'Check-up',
    'Follow-up',
    'Emergency',
    'Other'
  ];

  useEffect(() => {
    if (reason) {
      setReasons(reason.split(',').map(r => r.trim())); // Set the reasons if passed as a parameter
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

  const handleReasonToggle = (reasonOption) => {
    setReasons(prevReasons => {
      if (prevReasons.includes(reasonOption)) {
        return prevReasons.filter(r => r !== reasonOption);
      } else {
        return [...prevReasons, reasonOption];
      }
    });
  };

  const handleVaccineTypeToggle = (vaccineType) => {
    setSelectedVaccineTypes(prevTypes => {
      if (prevTypes.includes(vaccineType)) {
        return prevTypes.filter(type => type !== vaccineType);
      } else {
        return [...prevTypes, vaccineType];
      }
    });
  };

  const handleConsultationReasonToggle = (consultReason) => {
    setSelectedConsultationReasons(prevReasons => {
      if (prevReasons.includes(consultReason)) {
        return prevReasons.filter(r => r !== consultReason);
      } else {
        return [...prevReasons, consultReason];
      }
    });
  };

  const handleSaveAppointment = async () => {
    if (
      owner_name.trim() &&
      (reasons_for_visit.length > 0 || custom_reason.trim()) &&
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
        // Format the reasons array to a comma-separated string
        const formattedReasons = reasons_for_visit.join(', ');
        
        const appointmentData = {
          user_id: user_id,
          pet_id: selectedPet,
          pet_name: selectedPetDetails.name,
          owner_name: owner_name.trim(),
          reason_for_visit: formattedReasons,
          consultation_types: reasons_for_visit.includes('Consultation') ? selectedConsultationReasons.join(', ') : null,
          other_consultation_reason: selectedConsultationReasons.includes('Other') ? consultationReason.trim() : null,
          vaccination_types: reasons_for_visit.includes('Vaccination') ? selectedVaccineTypes.join(', ') : null,
          other_vaccination_type: selectedVaccineTypes.includes('Other') ? otherVaccinationType.trim() : null,
          other_reason: reasons_for_visit.includes('Other') ? custom_reason.trim() : null,
          appointment_date: appointment_date.trim(),
          appointment_time: appointment_time.trim(),
          status: 'Pending'
        };

        console.log('Sending appointment data:', appointmentData);

        const response = await fetch(`http://${SERVER_IP}/PetFurMe-Application/api/appointments/save.php`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        });

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success) {
          await logActivity(
            ACTIVITY_TYPES.APPOINTMENT_BOOKED,
            user_id,
            {
              petName: selectedPetDetails.name,
              reasons: formattedReasons,
              date: appointment_date,
              time: appointment_time
            }
          );
          
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
              <RNPickerSelect
                style={styles.picker}
                onValueChange={(itemValue) => {
                  setSelectedPet(itemValue);
                  console.log("Selected pet:", pets.find(p => p.id === itemValue));
                }}
                items={pets.map(pet => ({
                  label: pet.name,
                  value: pet.id,
                }))}
              />
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
                  reasons_for_visit.includes(reasonOption) && styles.selectedReasonButton,
                ]}
                onPress={() => handleReasonToggle(reasonOption)}
              >
                <Text
                  style={[
                    styles.reasonButtonText,
                    reasons_for_visit.includes(reasonOption) && styles.selectedReasonButtonText,
                  ]}
                >
                  {reasonOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add custom reason input field */}
          {reasons_for_visit.includes('Other') && (
            <TextInput
              style={[styles.input, styles.customReasonInput]}
              value={custom_reason}
              onChangeText={setCustomReason}
              placeholder="Please specify your reason"
              placeholderTextColor="#b3b3b3"
              multiline
            />
          )}

          {/* {reasons_for_visit.includes('Vaccination') && (
            <View style={styles.vaccineTypesContainer}>
              <Text style={styles.subLabel}>Select Vaccination Type(s)</Text>
              <View style={styles.vaccineButtonsContainer}>
                {VACCINATION_TYPES.map((vaccineType) => (
                  <TouchableOpacity
                    key={vaccineType}
                    style={[
                      styles.vaccineButton,
                      selectedVaccineTypes.includes(vaccineType) && styles.selectedVaccineButton,
                    ]}
                    onPress={() => handleVaccineTypeToggle(vaccineType)}
                  >
                    <Text
                      style={[
                        styles.vaccineButtonText,
                        selectedVaccineTypes.includes(vaccineType) && styles.selectedVaccineButtonText,
                      ]}
                    >
                      {vaccineType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedVaccineTypes.includes('Other') && (
                <TextInput
                  style={[styles.input, styles.customReasonInput]}
                  value={otherVaccinationType}
                  onChangeText={setOtherVaccinationType}
                  placeholder="Please specify vaccination type"
                  placeholderTextColor="#b3b3b3"
                  multiline
                />
              )}
            </View>
          )} */}

          {/* {reasons_for_visit.includes('Consultation') && (
            <View style={styles.consultationContainer}>
              <Text style={styles.subLabel}>Select Consultation Type(s)</Text>
              <View style={styles.reasonButtonsContainer}>
                {CONSULTATION_REASONS.map((consultReason) => (
                  <TouchableOpacity
                    key={consultReason}
                    style={[
                      styles.reasonButton,
                      selectedConsultationReasons.includes(consultReason) && styles.selectedReasonButton,
                    ]}
                    onPress={() => handleConsultationReasonToggle(consultReason)}
                  >
                    <Text
                      style={[
                        styles.reasonButtonText,
                        selectedConsultationReasons.includes(consultReason) && styles.selectedReasonButtonText,
                      ]}
                    >
                      {consultReason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedConsultationReasons.includes('Other') && (
                <TextInput
                  style={[styles.input, styles.customReasonInput]}
                  value={consultationReason}
                  onChangeText={setConsultationReason}
                  placeholder="Please specify consultation reason"
                  placeholderTextColor="#b3b3b3"
                  multiline
                />
              )}
            </View>
          )} */}

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
  vaccineTypesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 10,
  },
  vaccineButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vaccineButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedVaccineButton: {
    backgroundColor: '#CC38F2',
  },
  vaccineButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '500',
  },
  selectedVaccineButtonText: {
    color: '#FFFFFF',
  },
  consultationContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
});

export default AddAppointment;
