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
import { BASE_URL, SERVER_IP, SERVER_PORT, API_BASE_URL } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import CustomHeader from '../components/CustomHeader';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, apiRequest, safeFetch } from '../utils/apiHelper';

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

const getPetTypeIcon = (petType) => {
  const type = petType?.toLowerCase() || '';
  switch (type) {
    case 'cat':
      return 'cat';
    case 'rabbit':
      return 'rabbit';
    case 'bird':
      return 'bird';
    case 'dog':
    default:
      return 'dog';
  }
};

const Consultation = ({ navigation, route }) => {
  const user_id = route.params?.user_id;
  const selected_pet = route.params?.selected_pet;
  const isRescheduling = route.params?.isRescheduling || false;
  const originalAppointment = route.params?.originalAppointment || null;
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(selected_pet || null);
  const [reasons_for_visit, setReasons] = useState([]);
  const [custom_reason, setCustomReason] = useState('');
  const [appointment_date, setDate] = useState(new Date());
  const [appointment_time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [selectedVaccineTypes, setSelectedVaccineTypes] = useState([]);
  const [otherVaccinationType, setOtherVaccinationType] = useState('');
  const [selectedConsultationReasons, setSelectedConsultationReasons] = useState([]);
  const [consultationReason, setConsultationReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [showWebAlert, setShowWebAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [userVerificationStatus, setUserVerificationStatus] = useState({
    verified: false,
    complete_credentials: false,
    loading: true
  });

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
    const checkSession = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (!storedUserId && !user_id) {
          console.log("No user_id found in Consultation, redirecting to login");
          Alert.alert(
            'Session Expired',
            'Please login again to continue.',
            [
              {
                text: 'OK',
                onPress: () => navigation.replace('LoginScreen')
              }
            ]
          );
        } else {
          // If we have user_id from route but not in storage, store it
          if (!storedUserId && user_id) {
            await AsyncStorage.setItem('user_id', user_id.toString());
          }
          fetchUserPets();
          
          // Handle rescheduling scenario
          if (isRescheduling && originalAppointment) {
            populateReschedulingData();
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();
  }, [user_id, isRescheduling, originalAppointment]);

  useEffect(() => {
    // Log the route params to understand what we're getting
    if (isRescheduling) {
      console.log('Rescheduling is true');
      console.log('Original appointment data:', originalAppointment);
      // Check if originalAppointment is just [object Object] string
      if (typeof originalAppointment === 'string' && originalAppointment.includes('[object Object]')) {
        console.error('Original appointment is not properly serialized');
      }
    }
  }, []);

  const fetchUserPets = async () => {
    try {
      if (!user_id) {
        throw new Error('No user ID available');
      }

      // Add debug logs
      console.log('Fetching pets for user_id:', user_id);
      const url = getApiUrl('pets/get_user_pets.php', { user_id });
      console.log('Fetch URL:', url);

      const response = await safeFetch(url);
      
      // Add response debugging
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pets data received:', data);
      
      if (data.success) {
        setPets(data.pets);
        // Only set selectedPet if there's a pet passed through route params
        if (selected_pet) {
          setSelectedPet(selected_pet.id.toString());
        }
      } else {
        throw new Error(data.message || 'Failed to fetch pets');
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      Alert.alert(
        "Error",
        "Failed to load pets. Please try again.",
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const populateReschedulingData = () => {
    console.log('Populating rescheduling data:', originalAppointment);
    try {
      // Set pet selection
      if (originalAppointment.pet_id) {
        setSelectedPet(originalAppointment.pet_id.toString());
      }
      
      // Set reasons for visit
      if (originalAppointment.reason_for_visit) {
        let reasons = [];
        try {
          reasons = JSON.parse(originalAppointment.reason_for_visit);
          if (!Array.isArray(reasons)) {
            reasons = [reasons];
          }
        } catch (e) {
          // If parsing fails, treat it as a single string
          reasons = [originalAppointment.reason_for_visit];
        }
        setReasons(reasons);
      }
      
      // Set appointment date
      if (originalAppointment.appointment_date) {
        const dateObj = new Date(originalAppointment.appointment_date);
        setDate(dateObj);
        const formattedDate = moment(dateObj).format('YYYY-MM-DD');
        setAppointmentDate(formattedDate);
      }
      
      // Set appointment time
      if (originalAppointment.appointment_time) {
        const timeObj = moment(originalAppointment.appointment_time, 'HH:mm').toDate();
        setTime(timeObj);
        setAppointmentTime(originalAppointment.appointment_time);
      }
      
      // If this is a vaccination appointment, set vaccine types
      if (originalAppointment.reason_for_visit && 
          JSON.parse(originalAppointment.reason_for_visit).includes('Vaccination') &&
          originalAppointment.vaccine_types) {
        try {
          const vaccineTypes = JSON.parse(originalAppointment.vaccine_types);
          setSelectedVaccineTypes(vaccineTypes);
        } catch (e) {
          console.error('Error parsing vaccine types:', e);
        }
      }
      
      // If this is a consultation appointment, set consultation reasons
      if (originalAppointment.reason_for_visit && 
          JSON.parse(originalAppointment.reason_for_visit).includes('Consultation') &&
          originalAppointment.consultation_reasons) {
        try {
          const consultReasons = JSON.parse(originalAppointment.consultation_reasons);
          setSelectedConsultationReasons(consultReasons);
        } catch (e) {
          console.error('Error parsing consultation reasons:', e);
        }
      }
    } catch (error) {
      console.error('Error populating rescheduling data:', error);
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
      const selectedPetDetails = pets.find(p => p.id.toString() === selectedPet);
      if (!selectedPetDetails) {
        Alert.alert('Error', 'Selected pet not found');
        return;
      }

      setLoading(true);

      // Ensure all data is properly formatted before sending
      const formattedAppointmentData = {
        user_id: user_id.toString(),
        pet_id: selectedPet,
        pet_name: selectedPetDetails.name,
        pet_type: selectedPetDetails.type || 'pet',
        pet_age: selectedPetDetails.age ? selectedPetDetails.age.toString() : '0',
        reason_for_visit: JSON.stringify(reasons_for_visit),
        appointment_date: moment(appointmentDate).format('YYYY-MM-DD'),
        appointment_time: moment(appointmentTime, 'HH:mm').format('HH:mm')
      };

      // Choose the appropriate endpoint based on whether we're rescheduling or creating
      let endpoint;
      
      // Enhanced rescheduling logic
      if (isRescheduling) {
        console.log('Processing rescheduling request with:', originalAppointment);
        
        // Try multiple ways to get the ID
        let originalId = null;
        
        if (typeof originalAppointment === 'object' && originalAppointment !== null) {
          originalId = originalAppointment.id || originalAppointment.appointment_id;
          console.log('Found ID from object:', originalId);
        } 
        else if (typeof originalAppointment === 'string') {
          // Try to parse if it's a JSON string
          try {
            const parsed = JSON.parse(originalAppointment);
            originalId = parsed.id || parsed.appointment_id;
            console.log('Found ID from parsed string:', originalId);
          } catch (e) {
            console.error('Failed to parse originalAppointment string:', e);
          }
        }
        
        if (!originalId) {
          console.error('Could not extract original appointment ID');
          Alert.alert(
            'Error',
            'Cannot reschedule - original appointment data is missing. Please try again or book a new appointment.'
          );
          setLoading(false);
          return;
        }
        
        // Use the reschedule endpoint instead of save endpoint
        endpoint = `http://${SERVER_IP}/PetFurMe-Application/api/appointments/reschedule.php`;
        
        // Add to the request data
        formattedAppointmentData.original_appointment_id = originalId.toString();
      } else {
        // For new appointments, use the regular save endpoint
        endpoint = `http://${SERVER_IP}/PetFurMe-Application/api/appointments/save.php`;
      }

      console.log('Sending appointment data to API:', formattedAppointmentData);
      console.log('Using endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedAppointmentData)
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        throw new Error('Invalid response from server');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to save appointment');
      }

      setLoading(false);

      // Update success message
      const alertTitle = isRescheduling 
        ? 'Appointment Rescheduled Successfully! 🎉' 
        : 'Appointment Booked Successfully! 🎉';

      const successMessage = [
        `${getFormattedDate()}`,
        `${getFormattedTime()}`,
        '',
        `Pet: ${selectedPetDetails.name}`,
        `Service: ${reasons_for_visit.join(', ')}`,
        '',
        '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯',
        isRescheduling 
          ? 'We will notify you once your rescheduled appointment is confirmed.'
          : 'We will notify you once your appointment is confirmed.',
        '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯'
      ].join('\n');

      const alertButtons = [
        {
          text: 'View',
          onPress: async () => {
            try {
              await logActivity(
                isRescheduling ? ACTIVITY_TYPES.APPOINTMENT_RESCHEDULED : ACTIVITY_TYPES.APPOINTMENT_BOOKED, 
                {
                  appointment_id: result.appointment_id,
                  pet_id: selectedPet,
                  appointment_date: appointmentDate,
                  reason_for_visit: reasons_for_visit
                });
              
              setShowWebAlert(false);
              
              // Get and verify user_id
              const storedUserId = await AsyncStorage.getItem('user_id');
              const currentUserId = storedUserId || user_id;
              
              if (!currentUserId) {
                throw new Error('No user ID available');
              }

              // Force refresh by adding timestamp and forceRefresh flag
              if (Platform.OS === 'web') {
                // For web platform
                navigation.navigate('Appointment', {
                  user_id: currentUserId,
                  timestamp: Date.now(),
                  fromConsultation: true,
                  forceRefresh: true
                });
              } else {
                // For mobile platform with refresh
                navigation.navigate('Appointment', {
                  user_id: currentUserId,
                  timestamp: Date.now(),
                  fromConsultation: true,
                  forceRefresh: true
                });
              }
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Error', 'Failed to view appointment. Please try again.');
            }
          }
        },
        {
          text: 'Home',
          onPress: () => {
            logActivity(
              isRescheduling ? ACTIVITY_TYPES.APPOINTMENT_RESCHEDULED : ACTIVITY_TYPES.APPOINTMENT_BOOKED,
              {
                appointment_id: result.appointment_id,
                pet_id: selectedPet,
                appointment_date: appointmentDate,
                reason_for_visit: reasons_for_visit
              }
            );
            setShowWebAlert(false);
            // Modified navigation to match the expected URL format
            if (Platform.OS === 'web') {
              // For web platform with refresh parameter
              const timestamp = Date.now();
              window.location.href = `/home?user_id=${user_id}&timestamp=${timestamp}&refreshed=true`;
            } else {
              // For mobile platforms with refresh flag
              navigation.reset({
                index: 0,
                routes: [{ 
                  name: 'HomePage',
                  params: {
                    user_id: user_id,
                    timestamp: Date.now(),
                    refreshed: true
                  }
                }],
              });
            }
          }
        }
      ];

      showAlert(
        alertTitle,
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
      const date = new Date(appointmentDate);
      if (isNaN(date.getTime())) {
        return 'Select Date';
      }
      return moment(date).format('MMMM DD, YYYY');
    }
    return 'Select Date';
  };

  // Format the time for display
  const getFormattedTime = () => {
    if (appointmentTime) {
      // Format time as "10:30 AM"
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
            <option value="">Choose a pet</option>
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
            label: 'Choose a pet',
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
        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleInputContainer}>
            <View style={styles.scheduleInputWrapper}>
              <MaterialCommunityIcons 
                name="calendar" 
                size={20} 
                color={appointmentDate ? '#374151' : '#6B7280'} 
                style={styles.scheduleIcon} 
              />
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={appointmentDate ? getFormattedDate() : ''}
                  onFocus={(e) => {
                    e.target.type = 'date';
                    e.target.showPicker();
                  }}
                  onBlur={(e) => {
                    if (!appointmentDate) {
                      e.target.type = 'text';
                    }
                  }}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (date) {
                      setAppointmentDate(date);
                      checkAvailability(new Date(date));
                      e.target.type = 'text';
                    }
                  }}
                  style={{
                    ...styles.scheduleInput,
                    width: '100%',
                    color: appointmentDate ? '#374151' : '#9CA3AF',
                    fontSize: '14px',
                    fontWeight: appointmentDate ? '500' : '400',
                  }}
                  placeholder="Select Date"
                />
              </div>
              <MaterialCommunityIcons 
                name="chevron-down" 
                size={20} 
                color={appointmentDate ? '#374151' : '#6B7280'} 
                style={styles.scheduleArrow} 
              />
            </View>
          </View>

          <View style={styles.scheduleInputContainer}>
            <View style={styles.scheduleInputWrapper}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={20} 
                color={appointmentTime ? '#374151' : '#6B7280'} 
                style={styles.scheduleIcon} 
              />
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => {
                    const time = e.target.value;
                    setAppointmentTime(time);
                    e.target.blur(); // Hide the native time picker after selection
                  }}
                  style={{
                    ...styles.scheduleInput,
                    width: '100%',
                    color: 'transparent', // Hide the default time display
                    fontSize: '14px',
                    fontWeight: appointmentTime ? '500' : '400',
                    caretColor: 'transparent', // Hide the cursor
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: appointmentTime ? '#374151' : '#6B7280',
                  fontSize: '14px',
                  fontWeight: appointmentTime ? '500' : '400',
                  pointerEvents: 'none',
                  width: '100%'
                }}>
                  {appointmentTime ? getFormattedTime() : 'Select Time'}
                </div>
              </div>
              <MaterialCommunityIcons 
                name="chevron-down" 
                size={20} 
                color={appointmentTime ? '#374151' : '#6B7280'} 
                style={styles.scheduleArrow} 
              />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.scheduleContainer}>
        <TouchableOpacity
          style={styles.scheduleInputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.scheduleInputWrapper}>
            <MaterialCommunityIcons 
              name="calendar" 
              size={20} 
              color={appointmentDate ? '#374151' : '#6B7280'} 
              style={styles.scheduleIcon} 
            />
            <Text style={[
              styles.scheduleInput, 
              !appointmentDate && styles.schedulePlaceholder,
              appointmentDate && styles.selectedInput
            ]}>
              {appointmentDate ? getFormattedDate() : 'Select Date'}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={20} 
              color={appointmentDate ? '#374151' : '#6B7280'} 
              style={styles.scheduleArrow} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scheduleInputContainer}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={styles.scheduleInputWrapper}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={20} 
              color={appointmentTime ? '#374151' : '#6B7280'} 
              style={styles.scheduleIcon} 
            />
            <Text style={[
              styles.scheduleInput, 
              !appointmentTime && styles.schedulePlaceholder,
              appointmentTime && styles.selectedInput
            ]}>
              {appointmentTime ? getFormattedTime() : 'Select Time'}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={20} 
              color={appointmentTime ? '#374151' : '#6B7280'} 
              style={styles.scheduleArrow} 
            />
          </View>
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
      </View>
    );
  };

  // Add a function to check user verification status
  const checkUserVerificationStatus = async (userId) => {
    if (!userId) return;
    
    try {
      console.log('Checking verification status for user:', userId);
      const url = getApiUrl('users/check_profile_status.php', { user_id: userId });
      
      const response = await safeFetch(url);
      console.log('Verification status response:', response);
      
      if (response && response.success) {
        setUserVerificationStatus({
          verified: response.verified === "1" || response.verified === true,
          complete_credentials: response.complete_credentials === "1" || response.complete_credentials === true,
          loading: false
        });
      } else {
        console.error('Failed to get verification status:', response?.message || 'Unknown error');
        setUserVerificationStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setUserVerificationStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Add conditional rendering based on verification status
  const renderVerificationWarning = () => {
    if (userVerificationStatus.loading) return null;
    
    if (!userVerificationStatus.verified) {
      return (
        <View style={styles.verificationWarning}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={styles.verificationWarningText}>
            Your account is not yet verified. Some features may be limited.
          </Text>
        </View>
      );
    }
    
    if (!userVerificationStatus.complete_credentials) {
      return (
        <View style={styles.verificationWarning}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.verificationWarningText}>
            Please complete your profile information to access all features.
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Book Appointment"
        navigation={navigation}
        showBackButton={true}
      />

      {renderVerificationWarning()}

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Pet Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <MaterialCommunityIcons name="paw" size={24} color="#CC38F2" />
              <Text style={[styles.sectionHeaderText, { color: '#CC38F2' }]}>Select Your Pet</Text>
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
                          <MaterialCommunityIcons 
                            name={getPetTypeIcon(pet.type)} 
                            size={32} 
                            color="#CC38F2" 
                          />
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
              <Text style={[styles.sectionTitleText, { color: '#CC38F2' }]}> Reason for Visit</Text>
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
              <Text style={[styles.sectionHeaderText, { color: '#CC38F2' }]}>Schedule</Text>
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
              <Text style={styles.bookButtonText}>
                {isRescheduling ? "Reschedule Appointment" : "Book Appointment"}
              </Text>
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
    color: '#CC38F2',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CC38F2',
    marginLeft: 12,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
  scheduleContainer: {
    gap: 16,
  },
  scheduleInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
  },
  scheduleInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  scheduleInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    ...(Platform.OS === 'web' && {
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
      cursor: 'pointer',
      paddingLeft: 0,
      paddingRight: 0,
    }),
  },
  schedulePlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  scheduleIcon: {
    marginRight: 12,
    color: '#6B7280',
  },
  scheduleArrow: {
    marginLeft: 'auto',
    color: '#6B7280',
  },
  selectedInput: {
    color: '#374151',
    fontWeight: '500',
  },
  verificationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    marginTop: 8,
  },
  verificationWarningText: {
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
});

export default Consultation;
