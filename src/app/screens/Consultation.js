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
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import CustomHeader from '../components/CustomHeader';
import { Picker } from '@react-native-picker/picker';

// Modify the WebAlert component to work on both platforms
const WebAlert = ({ visible, title, message, buttons, onDismiss }) => {
  if (!visible) return null;

  // Split the message to identify the notification part
  const messageLines = message.split('\n');
  const notificationIndex = messageLines.findIndex(line => 
    line.includes('We will notify you')
  );

  // Reconstruct the message with styled notification
  const beforeNotification = messageLines.slice(0, notificationIndex - 1).join('\n');
  const notification = messageLines[notificationIndex];
  const afterNotification = messageLines.slice(notificationIndex + 2).join('\n');

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.webAlertOverlay}>
        <View style={styles.webAlertContainer}>
          <View style={styles.webAlertHeader}>
            <MaterialCommunityIcons name="check-circle" size={40} color="#CC38F2" />
            <Text style={styles.webAlertTitle}>{title}</Text>
          </View>
          
          <ScrollView style={styles.webAlertMessageContainer}>
            <Text style={styles.webAlertMessage}>{beforeNotification}</Text>
            
            <View style={styles.webAlertNotification}>
              <Text style={styles.webAlertNotificationText}>
                {notification}
              </Text>
            </View>

            {afterNotification && (
              <Text style={styles.webAlertMessage}>{afterNotification}</Text>
            )}
          </ScrollView>

          <View style={styles.webAlertButtonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.webAlertButton,
                  index === 0 ? styles.webAlertPrimaryButton : styles.webAlertSecondaryButton,
                  index === 0 && buttons.length > 1 && { marginRight: 8 }
                ]}
                onPress={button.onPress}
              >
                <Text style={[
                  styles.webAlertButtonText,
                  index === 0 ? styles.webAlertPrimaryButtonText : styles.webAlertSecondaryButtonText
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AddAppointment = ({ route, navigation }) => {
  const { reason, user_id } = route.params || {};
  const [reasons_for_visit, setReasons] = useState([]);
  const [custom_reason, setCustomReason] = useState('');
  const [appointment_date, setDate] = useState(new Date());
  const [appointment_time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [availableSlots, setAvailableSlots] = useState(null);
  const [selectedVaccineTypes, setSelectedVaccineTypes] = useState([]);
  const [otherVaccinationType, setOtherVaccinationType] = useState('');
  const [selectedConsultationReasons, setSelectedConsultationReasons] = useState([]);
  const [consultationReason, setConsultationReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [showWebAlert, setShowWebAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

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

  // Modify the showAlert function to use WebAlert for all platforms
  const showAlert = (title, message, buttons) => {
    setAlertConfig({ title, message, buttons });
    setShowWebAlert(true);
  };

  const handleSaveAppointment = async () => {
    try {
      // Initial validation checks
      if (!user_id || !selectedPet || !appointmentDate || !appointmentTime || reasons_for_visit.length === 0) {
        const missingFields = [];
        if (!user_id) missingFields.push('User ID');
        if (!selectedPet) missingFields.push('Pet');
        if (!appointmentDate) missingFields.push('Appointment Date');
        if (!appointmentTime) missingFields.push('Appointment Time');
        if (reasons_for_visit.length === 0) missingFields.push('Reason for Visit');

        Alert.alert('Missing Information', `Please provide: ${missingFields.join(', ')}`);
        return;
      }

      // Get the selected pet's details
      const selectedPetDetails = pets.find(p => p.id.toString() === selectedPet.toString());
      if (!selectedPetDetails) {
        Alert.alert('Error', 'Selected pet not found');
        return;
      }

      setLoading(true);

      // Ensure all data is properly formatted before sending
      const formattedAppointmentData = {
        user_id: user_id.toString(), // Convert to string as API expects
        pet_id: selectedPet.toString(), // Convert to string as API expects
        pet_name: selectedPetDetails.name,
        pet_type: selectedPetDetails.type || 'pet',
        pet_age: selectedPetDetails.age ? selectedPetDetails.age.toString() : '0',
        reason_for_visit: JSON.stringify(reasons_for_visit),
        appointment_date: moment(appointmentDate).format('YYYY-MM-DD'),
        appointment_time: moment(appointmentTime, 'HH:mm').format('HH:mm')
      };

      // Debug log
      console.log('Sending appointment data:', formattedAppointmentData);

      const response = await fetch(`http://${SERVER_IP}/PetFurMe-Application/api/appointments/save.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedAppointmentData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save appointment');
      }

      setLoading(false);

      // Format success message with highlighted notification
      const successMessage = [
        `${getFormattedDate()}`,
        `${getFormattedTime()}`,
        '',
        `Pet: ${selectedPetDetails.name}`,
        `Service: ${reasons_for_visit.join(', ')}`,
        '',
        '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯',  // Add a divider line
        'We will notify you once your appointment is confirmed.',
        '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯'   // Add a divider line
      ].join('\n');

      const alertButtons = [
        {
          text: 'View',
          onPress: () => {
            logActivity(ACTIVITY_TYPES.BOOK_APPOINTMENT, {
              appointment_id: result.appointment_id,
              pet_id: selectedPet,
              appointment_date: appointmentDate,
              reason_for_visit: reasons_for_visit
            });
            setShowWebAlert(false);
            navigation.navigate('Appointment');
          }
        },
        {
          text: 'Home',
          onPress: () => {
            logActivity(ACTIVITY_TYPES.BOOK_APPOINTMENT, {
              appointment_id: result.appointment_id,
              pet_id: selectedPet,
              appointment_date: appointmentDate,
              reason_for_visit: reasons_for_visit
            });
            setShowWebAlert(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        }
      ];

      showAlert(
        'Appointment Booked Successfully! 🎉',
        successMessage,
        alertButtons
      );

    } catch (error) {
      setLoading(false);
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Error',
        'Failed to book appointment. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Format the date for display
  const getFormattedDate = () => {
    if (appointmentDate) {
      return moment(appointmentDate).format('MMMM DD, YYYY');
    }
    return 'Select Date';
  };

  // Format the time for display
  const getFormattedTime = () => {
    if (appointmentTime) {
      return moment(appointmentTime, 'HH:mm').format('hh:mm A');
    }
    return 'Select Time';
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

  const handleDateConfirm = async (selectedDate) => {
    try {
      const isAvailable = await checkAvailability(selectedDate);
      if (isAvailable) {
        setDate(selectedDate);
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
        setAppointmentDate(formattedDate);
      } else {
        Alert.alert(
          'Date Unavailable',
          'This date is fully booked. Please select another date.'
        );
      }
    } catch (error) {
      console.error('Error handling date confirmation:', error);
      Alert.alert('Error', 'Failed to check date availability');
    }
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (selectedTime) => {
    try {
      setTime(selectedTime);
      const formattedTime = moment(selectedTime).format('HH:mm');
      setAppointmentTime(formattedTime);
    } catch (error) {
      console.error('Error handling time confirmation:', error);
      Alert.alert('Error', 'Failed to set appointment time');
    }
    setShowTimePicker(false);
  };

  const renderPetSelector = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webPickerContainer}>
          <MaterialCommunityIcons name="paw" size={20} color="#CC38F2" style={styles.webPickerIcon} />
          <select
            value={selectedPet || ''}
            onChange={(e) => setSelectedPet(e.target.value)}
            style={styles.webSelect}
          >
            <option value="">Select your pet</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id.toString()}>
                {pet.name}
              </option>
            ))}
          </select>
          <MaterialCommunityIcons name="chevron-down" size={24} color="#6B7280" style={styles.webPickerArrow} />
        </View>
      );
    }

    return (
      <View style={styles.pickerOuterContainer}>
        <RNPickerSelect
          onValueChange={(itemValue) => setSelectedPet(itemValue || '')}
          value={selectedPet || ''}
          items={pets.map(pet => ({
            label: pet.name,
            value: pet.id.toString(),
          }))}
          placeholder={{
            label: 'Select your pet',
            value: '',
            color: '#9CA3AF',
          }}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          Icon={() => (
            <MaterialCommunityIcons name="chevron-down" size={24} color="#6B7280" />
          )}
        />
        <View style={styles.pickerLeftIcon}>
          <MaterialCommunityIcons name="paw" size={20} color="#CC38F2" />
        </View>
      </View>
    );
  };

  const renderDateTimePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <>
          <View style={styles.webDateTimeContainer}>
            <MaterialCommunityIcons name="calendar" size={24} color="#666" />
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => {
                const date = e.target.value;
                setAppointmentDate(date);
                checkAvailability(new Date(date));
              }}
              style={styles.webDateTimeInput}
            />
          </View>
          <View style={styles.webDateTimeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              style={styles.webDateTimeInput}
            />
          </View>
        </>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={24} color="#666" />
          <View style={styles.dateTimeContent}>
            <Text style={styles.dateTimeLabel}>Date</Text>
            <Text style={styles.dateTimeValue}>{getFormattedDate()}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
          <View style={styles.dateTimeContent}>
            <Text style={styles.dateTimeLabel}>Time</Text>
            <Text style={styles.dateTimeValue}>{getFormattedTime()}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
          minimumDate={new Date()}
        />
        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Book Appointment"
        navigation={navigation}
        showBackButton={true}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Pet Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <MaterialCommunityIcons name="paw" size={24} color="#CC38F2" />
              <Text style={styles.sectionHeaderText}>Select Your Pet</Text>
            </View>
            
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Pet Name</Text>
              {renderPetSelector()}
            </View>

            {/* Selected pet details card */}
            {selectedPet && (
              <View style={styles.petCardContainer}>
                {(() => {
                  const pet = pets.find(p => p.id.toString() === selectedPet);
                  if (!pet) return null;
                  
                  return (
                    <View style={styles.petCard}>
                      <View style={styles.petCardHeader}>
                        <View style={styles.petAvatarContainer}>
                          <MaterialCommunityIcons name="dog" size={32} color="#CC38F2" />
                        </View>
                        <View style={styles.petHeaderInfo}>
                          <Text style={styles.petName}>{pet.name}</Text>
                          <Text style={styles.petSubInfo}>{`${pet.breed || 'Unknown Breed'}`}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.petDetailsGrid}>
                        <View style={styles.petDetailItem}>
                          <MaterialCommunityIcons name="dog-side" size={20} color="#CC38F2" />
                          <View style={styles.petDetailTextContainer}>
                            <Text style={styles.petDetailLabel}>Type</Text>
                            <Text style={styles.petDetailValue}>{pet.type || 'N/A'}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.petDetailItem}>
                          <MaterialCommunityIcons name="calendar-blank" size={20} color="#CC38F2" />
                          <View style={styles.petDetailTextContainer}>
                            <Text style={styles.petDetailLabel}>Age</Text>
                            <Text style={styles.petDetailValue}>{pet.age || 'N/A'}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.petDetailItem}>
                          <MaterialCommunityIcons name="gender-male-female" size={20} color="#CC38F2" />
                          <View style={styles.petDetailTextContainer}>
                            <Text style={styles.petDetailLabel}>Gender</Text>
                            <Text style={styles.petDetailValue}>{pet.gender || 'N/A'}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.petDetailItem}>
                          <MaterialCommunityIcons name="weight" size={20} color="#CC38F2" />
                          <View style={styles.petDetailTextContainer}>
                            <Text style={styles.petDetailLabel}>Weight</Text>
                            <Text style={styles.petDetailValue}>{pet.weight ? `${pet.weight} kg` : 'N/A'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}
          </View>

          {/* Reason for Visit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons name="clipboard-text" size={20} color="#CC38F2" />
              <Text style={styles.sectionTitleText}> Reason for Visit</Text>
            </Text>
            <View style={styles.reasonButtonsContainer}>
              {[
                { label: 'Consultation', icon: 'stethoscope' },
                { label: 'Vaccination', icon: 'needle' },
                { label: 'Deworming', icon: 'pill' },
                { label: 'Grooming', icon: 'scissors-cutting' },
                { label: 'Other', icon: 'dots-horizontal' }
              ].map(({ label, icon }) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.reasonButton,
                    reasons_for_visit.includes(label) && styles.selectedReasonButton,
                  ]}
                  onPress={() => handleReasonToggle(label)}
                >
                  <MaterialCommunityIcons 
                    name={icon} 
                    size={20} 
                    color={reasons_for_visit.includes(label) ? '#FFF' : '#666'} 
                  />
                  <Text
                    style={[
                      styles.reasonButtonText,
                      reasons_for_visit.includes(label) && styles.selectedReasonButtonText,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date and Time Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#CC38F2" />
              <Text style={styles.sectionHeaderText}>Schedule</Text>
            </View>
            {renderDateTimePicker()}
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleSaveAppointment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.bookButtonContent}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#FFF" />
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <WebAlert
        visible={showWebAlert}
        {...alertConfig}
        onDismiss={() => setShowWebAlert(false)}
      />
    </View>
  );
};

const pickerSelectStyles = {
  inputIOS: {
    height: 50,
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 12,
    color: '#1F2937',
    paddingRight: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputAndroid: {
    height: 50,
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 8,
    paddingHorizontal: 50,
    borderRadius: 12,
    color: '#1F2937',
    paddingRight: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewContainer: {
    borderRadius: 12,
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerOuterContainer: {
    position: 'relative',
    borderRadius: 12,
  },
  pickerLeftIcon: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  dropdownIconContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCardContainer: {
    marginTop: 16,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  petCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  petAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0E6FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petHeaderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  petSubInfo: {
    fontSize: 14,
    color: '#666',
  },
  petDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  petDetailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  petDetailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  petDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  petDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  reasonButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reasonButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedReasonButton: {
    backgroundColor: '#CC38F2',
    borderColor: '#CC38F2',
  },
  reasonButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedReasonButtonText: {
    color: '#FFF',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dateTimeContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#666',
  },
  dateTimeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 2,
  },
  dateTimeIcon: {
    marginLeft: 'auto',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  bookButton: {
    backgroundColor: '#CC38F2',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#CC38F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  webPickerContainer: {
    position: 'relative',
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  webSelect: {
    width: '100%',
    height: '100%',
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
    color: '#1F2937',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  webPickerIcon: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  webPickerArrow: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    pointerEvents: 'none',
  },
  webDateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 16,
  },
  webDateTimeInput: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    border: 'none',
    outline: 'none',
    flex: 1,
  },
  webAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webAlertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webAlertHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  webAlertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  webAlertMessageContainer: {
    marginVertical: 16,
    maxHeight: Platform.OS === 'web' ? 200 : 'auto',
  },
  webAlertMessage: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  webAlertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  webAlertButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  webAlertButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  webAlertPrimaryButton: {
    backgroundColor: '#CC38F2',
  },
  webAlertSecondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CC38F2',
  },
  webAlertPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  webAlertSecondaryButtonText: {
    color: '#CC38F2',
    fontSize: 16,
    fontWeight: '600',
  },
  webAlertNotification: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  webAlertNotificationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AddAppointment;
