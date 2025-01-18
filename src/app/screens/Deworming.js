import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddAppointment = ({ route, navigation }) => {
  const { reason } = route.params || {}; // Retrieve reason from navigation params
  const [owner_name, setOwnerName] = useState('');
  const [reason_for_visit, setReason] = useState(reason || ''); // Initialize with passed reason
  const [appointment_date, setDate] = useState('');
  const [appointment_time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reason) {
      setReason(reason); // Set the reason from navigation params
    }
  }, [reason]);

  const handleSaveAppointment = async () => {
    if (
      owner_name.trim() &&
      reason_for_visit.trim() &&
      appointment_date.trim() &&
      appointment_time.trim()
    ) {
      setLoading(true); // Show loading spinner
      try {
        const response = await fetch('http://192.168.0.110:3000/saveAppointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            owner_name,
            reason_for_visit,
            appointment_date,
            appointment_time,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          Alert.alert('Success', result.message);
          navigation.goBack();
        } else {
          Alert.alert('Error', result.error || 'Failed to save appointment');
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to connect to the server. Check your connection or server.');
        console.error('Error:', error.message);
      } finally {
        setLoading(false); // Hide loading spinner
      }
    } else {
      Alert.alert('Validation Error', 'Please fill out all the fields.');
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
        <TextInput
          style={styles.input}
          value={reason_for_visit}
          onChangeText={setReason}
          placeholderTextColor="#b3b3b3"
        />

        {/* Appointment Date Input */}
        <Text style={styles.inputLabel}>Appointment Date</Text>
        <TextInput
          style={styles.input}
          placeholder="(dd/mm/yyyy)"
          value={appointment_date}
          onChangeText={setDate}
          placeholderTextColor="#b3b3b3"
        />

        {/* Appointment Time Input */}
        <Text style={styles.inputLabel}>Appointment Time</Text>
        <TextInput
          style={styles.input}
          placeholder="--:-- --"
          value={appointment_time}
          onChangeText={setTime}
          placeholderTextColor="#b3b3b3"
        />
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
});

export default AddAppointment;
