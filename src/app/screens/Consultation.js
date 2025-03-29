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
import { Calendar } from 'react-native-calendars';

// Modified WebAlert component with updated header-matching color
const WebAlert = ({ visible, title, message, buttons, onDismiss }) => {
  if (!visible) return null;

  // Split the message to identify the notification part
  const messageLines = message.split('\n');
  const notificationIndex = messageLines.findIndex(line => 
    line.includes('We will notify you')
  );

  // Reconstruct the message with styled notification
  const beforeNotification = messageLines.slice(0, notificationIndex).join('\n');
  const notification = messageLines[notificationIndex];
  const afterNotification = messageLines.slice(notificationIndex + 1).join('\n');

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
            <MaterialCommunityIcons name="check-circle" size={40} color="#8146C1" />
            <Text style={styles.webAlertTitle}>{title}</Text>
          </View>
          
          <View style={styles.webAlertMessageContainer}>
            <Text style={styles.webAlertMessage}>{beforeNotification}</Text>
            
            <View style={styles.webAlertNotification}>
              <Text style={styles.webAlertNotificationText}>
                {notification}
              </Text>
            </View>

            {afterNotification && (
              <Text style={styles.webAlertMessage}>{afterNotification}</Text>
            )}
          </View>

          <View style={styles.webAlertButtonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.webAlertButton,
                  index === 0 ? styles.webAlertPrimaryButton : styles.webAlertSecondaryButton,
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
  const [reasons, setReasons] = useState([]);
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

      // Replace safeFetch with a direct fetch call to better handle the response
      const response = await fetch(url);
      
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
      setLoading(true);
      
      // Determine the reason for visit - ensure it's a non-empty string
      let reasonForVisit = '';
      
      if (reasons && reasons.length > 0) {
        // Convert the array to a JSON string instead of comma-separated values
        reasonForVisit = JSON.stringify(reasons);
      } else if (selectedConsultationReasons && selectedConsultationReasons.length > 0) {
        // Convert the array to a JSON string
        reasonForVisit = JSON.stringify(selectedConsultationReasons);
      } else if (consultationReason && consultationReason.trim() !== '') {
        reasonForVisit = consultationReason;
      } else {
        // Default reason if nothing is selected
        reasonForVisit = JSON.stringify(["General check-up"]);
      }
      
      // Validate all required fields
      if (!selectedPet || !appointmentDate || !appointmentTime) {
        Alert.alert(
          "Missing Information",
          "Please fill in all required fields to book your appointment."
        );
        setLoading(false);
        return;
      }
      
      // Find the selected pet details
      const pet = pets.find(p => p.id.toString() === selectedPet);
      if (!pet) {
        Alert.alert("Error", "Selected pet not found. Please try again.");
        setLoading(false);
        return;
      }
      
      // Prepare appointment data with explicit type conversions
      const appointmentData = {
        user_id: parseInt(user_id, 10),
        pet_id: parseInt(pet.id, 10),
        pet_name: String(pet.name),
        pet_type: String(pet.type).toLowerCase(),
        pet_age: parseInt(pet.age, 10),
        reason_for_visit: reasonForVisit, // Now properly formatted as JSON string
        appointment_date: String(appointmentDate),
        appointment_time: String(appointmentTime)
      };
      
      console.log('Sending appointment data to API:', appointmentData);
      
      // Use the API endpoint
      const endpoint = `${API_BASE_URL}/appointments/save.php`;
      console.log('Using endpoint:', endpoint);
      
      // Make a POST request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });
      
      const responseText = await response.text();
      console.log('Raw API response: ', responseText);
      
      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error(`Invalid response format: ${responseText}`);
      }
      
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Failed to book appointment');
      }
      
      // Log the activity
      await logActivity(ACTIVITY_TYPES.BOOK_APPOINTMENT, {
        pet_id: pet.id,
        pet_name: pet.name,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason: reasonForVisit
      });
      
      // Show success message - use a readable format for display
      const readableReason = Array.isArray(reasons) && reasons.length > 0 
        ? reasons.join(', ') 
        : (Array.isArray(selectedConsultationReasons) && selectedConsultationReasons.length > 0 
          ? selectedConsultationReasons.join(', ') 
          : (consultationReason || "General check-up"));
      
      const appointmentDateTime = `${moment(appointmentDate).format('MMMM D, YYYY')} at ${moment(appointmentTime, 'HH:mm').format('h:mm A')}`;
      
      setShowWebAlert(true);
      setAlertConfig({
        title: "Appointment Booked!",
        message: `Your appointment for ${pet.name} has been successfully booked for ${appointmentDateTime}.\n\nReason: ${readableReason}\n\nWe will notify you if there are any changes to your appointment.\n\nThank you for choosing PetFurMe!`,
        buttons: [
          {
            text: "View My Appointments",
            onPress: () => {
              setShowWebAlert(false);
              navigation.navigate('Appointments');
            }
          },
          {
            text: "OK",
            onPress: () => {
              setShowWebAlert(false);
              navigation.goBack();
            }
          }
        ]
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        "Booking Failed",
        `Unable to book your appointment. ${error.message}`
      );
    } finally {
      setLoading(false);
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

  // Modified to check if a date is Sunday
  const isSunday = (date) => {
    return date.getDay() === 0; // 0 represents Sunday
  };

  // Modified date/time picker handlers
  const openDatePicker = () => {
    console.log('Opening date picker...');
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    console.log('Opening time picker...');
    setShowTimePicker(true);
  };

  // Add this function to handle calendar date selection
  const handleCalendarDayPress = (day) => {
    const selectedDate = new Date(day.dateString);
    handleDateConfirm(selectedDate);
  };

  // Update the getMarkedDates function to properly mark Sundays as disabled
  const getMarkedDates = () => {
    const markedDates = {};
    
    // Mark selected date
    if (appointmentDate) {
      markedDates[appointmentDate] = { 
        selected: true, 
        selectedColor: '#8146C1' 
      };
    }
    
    // Mark Sundays as disabled
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Show 3 months ahead
    
    // Loop through each date in the range
    for (let d = new Date(currentDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Format the date as YYYY-MM-DD for the calendar
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Get the day of week (0 = Sunday, 6 = Saturday)
      const dayOfWeek = d.getDay();
      
      // Check if it's a past date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (d < today) {
        // Disable past dates
        markedDates[dateString] = { 
          disabled: true, 
          disableTouchEvent: true,
          textColor: '#d9d9d9'
        };
      } 
      else if (dayOfWeek === 0) {  // Check if it's Sunday (0)
        // Disable Sundays
        console.log(`Marking Sunday as disabled: ${dateString}`);
        markedDates[dateString] = { 
          disabled: true, 
          disableTouchEvent: true,
          textColor: '#d9d9d9'
        };
      }
    }
    
    console.log('Marked dates:', markedDates);
    return markedDates;
  };

  // Update the handleDateConfirm function to check for past dates
  const handleDateConfirm = async (selectedDate) => {
    console.log('Date selected:', selectedDate);
    try {
      // Check if the selected date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        Alert.alert(
          'Invalid Date',
          'Please select a future date for your appointment.'
        );
        return;
      }
      
      // Check if the selected date is a Sunday
      if (isSunday(selectedDate)) {
        Alert.alert(
          'Clinic Closed',
          'The clinic is closed on Sundays. Please select another date.'
        );
      } else {
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
      }
    } catch (error) {
      console.error('Error handling date confirmation:', error);
      Alert.alert('Error', 'Failed to check date availability');
    }
    setShowDatePicker(false);
  };

  // Modified date/time picker handlers
  const handleTimeConfirm = (selectedTime) => {
    console.log('Time selected:', selectedTime);
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

  // Handle web-compatible pet selector
  const renderPetSelector = () => {
    // Web-specific implementation
    if (Platform.OS === 'web') {
      return (
        <View style={styles.pickerOuterContainer}>
          <MaterialCommunityIcons 
            name="paw" 
            size={20} 
            color="#8146C1" 
            style={styles.webPickerIcon}
          />
          <select
            value={selectedPet || ''}
            onChange={(e) => setSelectedPet(e.target.value)}
            style={{
              width: '100%',
              height: '48px',
              padding: '8px 36px',
              fontSize: '14px',
              color: selectedPet ? '#6a4190' : '#9CA3AF',
              border: '1px solid #DDC6F7',
              borderRadius: '12px',
              backgroundColor: 'white',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%238146C1\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>Choose a pet</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id.toString()}>
                {pet.name}
              </option>
            ))}
          </select>
        </View>
      );
    }
    
    // Mobile implementation
    return (
      <View style={styles.pickerOuterContainer}>
        <MaterialCommunityIcons 
          name="paw" 
          size={20} 
          color="#8146C1" 
          style={styles.pickerLeftIcon} 
        />
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
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={24} 
              color="#8146C1" 
              style={styles.pickerRightIcon} 
            />
          )}
        />
      </View>
    );
  };

  // Modify the renderDateTimePicker function to use DateTimePickerModal for all platforms
  const renderDateTimePicker = () => {
    return (
      <View style={styles.scheduleContainer}>
        <TouchableOpacity
          style={styles.scheduleInputContainer}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <View style={styles.scheduleInputWrapper}>
            <MaterialCommunityIcons 
              name="calendar" 
              size={20} 
              color={appointmentDate ? '#8146C1' : '#6B7280'} 
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
              color={appointmentDate ? '#8146C1' : '#6B7280'} 
              style={styles.scheduleArrow} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scheduleInputContainer}
          onPress={openTimePicker}
          activeOpacity={0.7}
        >
          <View style={styles.scheduleInputWrapper}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={20} 
              color={appointmentTime ? '#8146C1' : '#6B7280'} 
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
              color={appointmentTime ? '#8146C1' : '#6B7280'} 
              style={styles.scheduleArrow} 
            />
          </View>
        </TouchableOpacity>
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

  // Update the generateTimeSlots function to handle disabling past times for today
  const generateTimeSlots = () => {
    const slots = [];
    const morningStartHour = 8; // 8 AM
    const morningEndHour = 12; // 12 PM (lunch break starts)
    const afternoonStartHour = 13; // 1 PM (after lunch break)
    const afternoonEndHour = 15; // 3 PM
    
    // Check if selected date is today to disable past times
    const isToday = appointmentDate === moment(new Date()).format('YYYY-MM-DD');
    const currentHour = isToday ? new Date().getHours() : 0;
    const currentMinute = isToday ? new Date().getMinutes() : 0;
    
    // Morning slots (8 AM to 12 PM)
    for (let hour = morningStartHour; hour < morningEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour < 10 ? `0${hour}` : hour;
        const m = minute === 0 ? '00' : minute;
        const time = `${h}:${m}`;
        const displayTime = moment(`${h}:${m}`, 'HH:mm').format('hh:mm A');
        
        // Check if this time is in the past for today
        const isPastTime = isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute));
        
        slots.push({ 
          time, 
          displayTime, 
          period: 'morning',
          disabled: isPastTime
        });
      }
    }
    
    // Afternoon slots (1 PM to 3 PM)
    for (let hour = afternoonStartHour; hour <= afternoonEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Don't go past 3 PM
        if (hour === afternoonEndHour && minute > 0) continue;
        
        const h = hour < 10 ? `0${hour}` : hour;
        const m = minute === 0 ? '00' : minute;
        const time = `${h}:${m}`;
        const displayTime = moment(`${h}:${m}`, 'HH:mm').format('hh:mm A');
        
        // Check if this time is in the past for today
        const isPastTime = isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute));
        
        slots.push({ 
          time, 
          displayTime, 
          period: 'afternoon',
          disabled: isPastTime
        });
      }
    }
    
    return slots;
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
          {/* Single Card Container for All Sections */}
          <View style={styles.cardContainer}>
            {/* Pet Selection */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderContainer}>
                <MaterialCommunityIcons name="paw" size={24} color="#8146C1" />
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
                            <MaterialCommunityIcons 
                              name={getPetTypeIcon(pet.type)} 
                              size={32} 
                              color="#8146C1" 
                            />
                          </View>
                          <View style={styles.petHeaderInfo}>
                            <Text style={styles.petName}>{pet.name}</Text>
                            <Text style={styles.petSubInfo}>{`${pet.breed || 'Unknown Breed'}`}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.petDetailsGrid}>
                          <View style={styles.petDetailItem}>
                            <MaterialCommunityIcons name="dog-side" size={20} color="#8146C1" />
                            <View style={styles.petDetailTextContainer}>
                              <Text style={styles.petDetailLabel}>Type</Text>
                              <Text style={styles.petDetailValue}>{pet.type || 'N/A'}</Text>
                            </View>
                          </View>
                          
                          <View style={styles.petDetailItem}>
                            <MaterialCommunityIcons name="calendar-blank" size={20} color="#8146C1" />
                            <View style={styles.petDetailTextContainer}>
                              <Text style={styles.petDetailLabel}>Age</Text>
                              <Text style={styles.petDetailValue}>{pet.age || 'N/A'}</Text>
                            </View>
                          </View>
                          
                          <View style={styles.petDetailItem}>
                            <MaterialCommunityIcons name="gender-male-female" size={20} color="#8146C1" />
                            <View style={styles.petDetailTextContainer}>
                              <Text style={styles.petDetailLabel}>Gender</Text>
                              <Text style={styles.petDetailValue}>{pet.gender || 'N/A'}</Text>
                            </View>
                          </View>
                          
                          <View style={styles.petDetailItem}>
                            <MaterialCommunityIcons name="weight" size={20} color="#8146C1" />
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

            {/* Divider */}
            <View style={styles.divider} />

            {/* Reason for Visit */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderContainer}>
                <MaterialCommunityIcons name="clipboard-text" size={24} color="#8146C1" />
                <Text style={styles.sectionHeaderText}>Reason for Visit</Text>
              </View>
              <View style={styles.reasonButtonsContainer}>
                {[
                  { label: 'Consultation', icon: 'stethoscope' },
                  { label: 'Vaccination', icon: 'needle' },
                  { label: 'Deworming', icon: 'pill' },
                  { label: 'Grooming', icon: 'scissors-cutting' }
                ].map(({ label, icon }) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.reasonButton,
                      reasons.includes(label) && styles.selectedReasonButton,
                    ]}
                    onPress={() => handleReasonToggle(label)}
                  >
                    <MaterialCommunityIcons 
                      name={icon} 
                      size={20} 
                      color={reasons.includes(label) ? '#FFF' : '#8146C1'} 
                    />
                    <Text
                      style={[
                        styles.reasonButtonText,
                        reasons.includes(label) && styles.selectedReasonButtonText,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Date and Time Selection */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderContainer}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#8146C1" />
                <Text style={styles.sectionHeaderText}>Schedule</Text>
              </View>
              {renderDateTimePicker()}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date & Time Pickers - moved outside ScrollView for better rendering */}
      {Platform.OS === 'ios' || Platform.OS === 'android' ? (
        <>
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker(false)}
            minimumDate={new Date()}
            display="default"
            isDayDisabled={(data) => data.getDay() === 0} // Disable Sundays
          />
          
          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            onConfirm={handleTimeConfirm}
            onCancel={() => setShowTimePicker(false)}
            display="default"
          />
        </>
      ) : (
        // Web-specific implementation
        <>
          {showDatePicker && (
            <Modal 
              animationType="fade" 
              transparent={true} 
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <MaterialCommunityIcons name="close" size={24} color="#8146C1" />
                    </TouchableOpacity>
                  </View>
                  
                  <Calendar
                    current={appointmentDate || new Date()}
                    minDate={new Date().toISOString().split('T')[0]}
                    onDayPress={handleCalendarDayPress}
                    markedDates={getMarkedDates()}
                    firstDay={1} // Start week on Monday (0 = Sunday, 1 = Monday)
                    disableAllTouchEventsForDisabledDays={true}
                    theme={{
                      calendarBackground: '#ffffff',
                      textSectionTitleColor: '#8146C1',
                      selectedDayBackgroundColor: '#8146C1',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#8146C1',
                      dayTextColor: '#2d4150',
                      textDisabledColor: '#d9d9d9',
                      dotColor: '#8146C1',
                      selectedDotColor: '#ffffff',
                      arrowColor: '#8146C1',
                      monthTextColor: '#8146C1',
                      indicatorColor: '#8146C1',
                      textDayFontWeight: '300',
                      textMonthFontWeight: 'bold',
                      textDayHeaderFontWeight: '500',
                      textDayFontSize: 16,
                      textMonthFontSize: 16,
                      textDayHeaderFontSize: 14
                    }}
                  />
                  
                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      style={styles.modalButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
          
          {showTimePicker && (
            <Modal 
              animationType="fade" 
              transparent={true} 
              visible={showTimePicker}
              onRequestClose={() => setShowTimePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Time</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <MaterialCommunityIcons name="close" size={24} color="#8146C1" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.timePickerContainer}>
                    <View style={styles.timePickerHeader}>
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#8146C1" />
                      <Text style={styles.timePickerHeaderText}>Morning</Text>
                    </View>
                    
                    <View style={styles.timeGrid}>
                      {generateTimeSlots()
                        .filter(slot => slot.period === 'morning')
                        .map((slot) => (
                          <TouchableOpacity
                            key={slot.time}
                            style={[
                              styles.timeGridItem,
                              appointmentTime === slot.time && styles.selectedTimeGridItem,
                              slot.disabled && styles.disabledTimeGridItem
                            ]}
                            onPress={() => {
                              if (!slot.disabled) {
                                const today = new Date();
                                const [hours, minutes] = slot.time.split(':');
                                today.setHours(parseInt(hours, 10));
                                today.setMinutes(parseInt(minutes, 10));
                                handleTimeConfirm(today);
                              }
                            }}
                            disabled={slot.disabled}
                          >
                            <Text style={[
                              styles.timeGridItemText,
                              appointmentTime === slot.time && styles.selectedTimeGridItemText,
                              slot.disabled && styles.disabledTimeGridItemText
                            ]}>
                              {slot.displayTime}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                    
                    <View style={styles.lunchBreakContainer}>
                      <View style={styles.lunchBreakIconContainer}>
                        <MaterialCommunityIcons name="food-fork-drink" size={16} color="#FFF" />
                      </View>
                      <Text style={styles.lunchBreakText}>Lunch Break (12:00 PM - 1:00 PM)</Text>
                    </View>
                    
                    <View style={styles.timePickerHeader}>
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#8146C1" />
                      <Text style={styles.timePickerHeaderText}>Afternoon</Text>
                    </View>
                    
                    <View style={styles.timeGrid}>
                      {generateTimeSlots()
                        .filter(slot => slot.period === 'afternoon')
                        .map((slot) => (
                          <TouchableOpacity
                            key={slot.time}
                            style={[
                              styles.timeGridItem,
                              appointmentTime === slot.time && styles.selectedTimeGridItem,
                              slot.disabled && styles.disabledTimeGridItem
                            ]}
                            onPress={() => {
                              if (!slot.disabled) {
                                const today = new Date();
                                const [hours, minutes] = slot.time.split(':');
                                today.setHours(parseInt(hours, 10));
                                today.setMinutes(parseInt(minutes, 10));
                                handleTimeConfirm(today);
                              }
                            }}
                            disabled={slot.disabled}
                          >
                            <Text style={[
                              styles.timeGridItemText,
                              appointmentTime === slot.time && styles.selectedTimeGridItemText,
                              slot.disabled && styles.disabledTimeGridItemText
                            ]}>
                              {slot.displayTime}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>
                  
                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      style={styles.modalCancelButton}
                      onPress={() => setShowTimePicker(false)}
                    >
                      <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </>
      )}

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
    paddingVertical: 12,
    paddingHorizontal: 36, // Increased to make room for icon
    fontSize: 14,
    color: '#6a4190',
    fontWeight: '400',
    borderWidth: 1,
    borderColor: '#DDC6F7',
    borderRadius: 12,
    backgroundColor: 'white',
    paddingRight: 40, // Space for the dropdown icon
  },
  inputAndroid: {
    paddingVertical: 8,
    paddingHorizontal: 36, // Increased to make room for icon
    fontSize: 14,
    color: '#6a4190',
    fontWeight: '400',
    borderWidth: 1,
    borderColor: '#DDC6F7',
    borderRadius: 12,
    backgroundColor: 'white',
    paddingRight: 40, // Space for the dropdown icon
  },
  placeholder: {
    color: '#9CA3AF',
  },
  iconContainer: {
    top: 12,
    right: 12,
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBFD', // Very light violet background
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#8146C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#DDC6F7', // Lighter violet border
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionContainer: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#DDC6F7', // Light violet divider
    marginHorizontal: 0, // Span the full width
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8146C1', // Header matching violet
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
    color: '#8146C1', // Header matching violet
    marginLeft: 12,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6a4190', // Dark violet for labels
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerOuterContainer: {
    position: 'relative',
    borderRadius: 12,
    marginBottom: 8,
  },
  pickerLeftIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{translateY: -10}],
    zIndex: 10,
  },
  pickerRightIcon: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{translateY: -12}],
    zIndex: 10,
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
    borderWidth: 1,
    borderColor: '#DDC6F7', // Lighter violet border
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
    backgroundColor: '#F4EBFD', // Very light violet background
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
    color: '#6a4190', // Dark violet for name
    marginBottom: 4,
  },
  petSubInfo: {
    fontSize: 14,
    color: '#8146C1', // Header matching violet for subinfo
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
    color: '#8146C1', // Header matching violet for labels
    marginBottom: 2,
  },
  petDetailValue: {
    fontSize: 14,
    color: '#6a4190', // Dark violet for values
    fontWeight: '500',
  },
  reasonButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  reasonButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4EBFD', // Very light violet background
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDC6F7', // Lighter violet border
    height: 48,
  },
  selectedReasonButton: {
    backgroundColor: '#8146C1', // Header matching violet for selected state
    borderColor: '#8146C1', // Header matching violet border
  },
  reasonButtonText: {
    color: '#8146C1', // Header matching violet text
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
    backgroundColor: '#F4EBFD', // Very light violet background
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDC6F7', // Lighter violet border
  },
  dateTimeContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#8146C1', // Header matching violet for labels
  },
  dateTimeValue: {
    fontSize: 14,
    color: '#6a4190', // Dark violet for values
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
    borderTopColor: '#DDC6F7', // Lighter violet border
    shadowColor: '#8146C1',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bookButton: {
    backgroundColor: '#8146C1', // Header matching violet for button
    padding: 16,
    borderRadius: 12,
    shadowColor: '#8146C1',
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
    borderColor: '#DDC6F7', // Lighter violet border
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
    color: '#8146C1', // Header matching violet for icon
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
    borderColor: '#DDC6F7', // Lighter violet border
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
  },
  webAlertContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
    fontSize: 22,
    fontWeight: '600',
    color: '#8146C1',
    marginTop: 8,
    textAlign: 'center',
  },
  webAlertMessageContainer: {
    marginBottom: 20,
  },
  webAlertMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  webAlertNotification: {
    backgroundColor: '#F4EBFD',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  webAlertNotificationText: {
    fontSize: 14,
    color: '#6a4190',
    textAlign: 'center',
  },
  webAlertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  webAlertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  webAlertPrimaryButton: {
    backgroundColor: '#8146C1',
  },
  webAlertSecondaryButton: {
    backgroundColor: '#F4EBFD',
    borderWidth: 1,
    borderColor: '#DDC6F7',
  },
  webAlertButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  webAlertPrimaryButtonText: {
    color: '#FFF',
  },
  webAlertSecondaryButtonText: {
    color: '#8146C1',
  },
  scheduleContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  scheduleInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDC6F7', // Lighter violet border
    height: 48,
    marginBottom: 16,
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
    color: '#6a4190',
    fontWeight: '500',
  },
  schedulePlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  scheduleIcon: {
    marginRight: 12,
    color: '#8146C1', // Header matching violet for icon
  },
  scheduleArrow: {
    marginLeft: 'auto',
    color: '#8146C1', // Header matching violet for icon
  },
  selectedInput: {
    color: '#6a4190', // Dark violet for selected text
    fontWeight: '500',
  },
  verificationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0', // Warm orange background
    padding: 12,
    borderRadius: 8,
    margin: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFB74D', // Orange border
  },
  verificationWarningText: {
    color: '#E65100', // Dark orange text
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#8146C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDC6F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8146C1',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDC6F7',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F4EBFD',
  },
  modalButtonText: {
    color: '#8146C1',
    fontWeight: '600',
  },
  timePickerContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeGridItem: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDC6F7',
    borderRadius: 8,
  },
  timeGridItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6a4190',
  },
  selectedTimeGridItem: {
    backgroundColor: '#8146C1',
  },
  selectedTimeGridItemText: {
    color: '#FFF',
  },
  lunchBreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  lunchBreakText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8146C1',
    marginLeft: 8,
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timePickerHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8146C1',
    marginLeft: 8,
  },
  lunchBreakIconContainer: {
    backgroundColor: '#8146C1',
    borderRadius: 8,
    padding: 4,
    marginRight: 8,
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F4EBFD',
  },
  modalCancelButtonText: {
    color: '#8146C1',
    fontWeight: '600',
  },
  disabledTimeGridItem: {
    backgroundColor: '#d9d9d9',
  },
  disabledTimeGridItemText: {
    color: '#9CA3AF',
  },
});

export default Consultation;
