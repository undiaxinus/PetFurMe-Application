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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const AddAppointment = ({ route, navigation }) => {
  const { reason, user_id } = route.params || {}; // Get both reason and user_id from params
  const [owner_name, setOwnerName] = useState('');
  const [reason_for_visit, setReason] = useState(reason || ''); // Initialize with the passed reason
  const [appointment_date, setDate] = useState('');
  const [appointment_time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (reason) {
      setReason(reason); // Set the reason if passed as a parameter
    }
  }, [reason]);

  const handleSaveAppointment = async () => {
    if (
      owner_name.trim() &&
      reason_for_visit &&
      appointment_date.trim() &&
      appointment_time.trim()
    ) {
      if (!user_id) {
        Alert.alert('Error', 'User ID is missing. Please login again.');
        return;
      }

      setLoading(true);
      try {
        const appointmentData = {
          user_id: user_id, // Include user_id in the data
          owner_name: owner_name.trim(),
          reason_for_visit: reason_for_visit,
          appointment_date: appointment_date.trim(),
          appointment_time: appointment_time.trim(),
        };

        const response = await fetch('http://192.168.1.5/PetFurMe-Application/api/appointments/save.php', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        });

        const result = await response.json();

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
      Alert.alert('Validation Error', 'Please fill out all required fields');
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
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(moment(selectedDate).format('YYYY-MM-DD'));
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

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formLabel}>Fill out the form</Text>

        {/* Owner Name Input */}
        <Text style={styles.inputLabel}>Owner Name</Text>
        <TextInput
          style={styles.input}
          value={owner_name}
          onChangeText={setOwnerName}
          placeholderTextColor="#b3b3b3"
        />

        {/* Reason for Visit Input */}
        <Text style={styles.inputLabel}>Reason for Visit</Text>
        <View style={styles.reasonButtonsContainer}>
          {['Consultation', 'Vaccination', 'Deworming', 'Grooming'].map((reasonOption) => (
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

        {/* Date Picker */}
        <Text style={styles.inputLabel}>Appointment Date</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {getFormattedDate() || 'Select Date'}
          </Text>
          <Ionicons name="calendar" size={24} color="#CC38F2" />
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

        {/* Time Picker */}
        <Text style={styles.inputLabel}>Appointment Time</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {getFormattedTime() || 'Select Time'}
          </Text>
          <Ionicons name="time" size={24} color="#CC38F2" />
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

      {/* Save Appointment Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveAppointment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Appointment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    top: 40,
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
    flex: 1,
    top: 70,
  },
  formLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
    top: -10,
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
    marginBottom: 20,
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
});

export default AddAppointment;
