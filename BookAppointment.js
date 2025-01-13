import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddAppointment = ({ navigation }) => {
  const [userAccount, setUserAccount] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [petName, setPetName] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSaveAppointment = () => {
    if (
      userAccount.trim() &&
      ownerName.trim() &&
      petName.trim() &&
      category.trim() &&
      reason.trim() &&
      date.trim() &&
      time.trim()
    ) {
      alert('Appointment Saved Successfully!');
    } else {
      alert('Please fill out all the fields.');
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

        <TextInput
          style={styles.input}
          placeholder="User Account"
          value={userAccount}
          onChangeText={setUserAccount}
          placeholderTextColor="#b3b3b3"
        />

        <TextInput
          style={styles.input}
          placeholder="Owner Name"
          value={ownerName}
          onChangeText={setOwnerName}
          placeholderTextColor="#b3b3b3"
        />

        <TextInput
          style={styles.input}
          placeholder="Pet Name"
          value={petName}
          onChangeText={setPetName}
          placeholderTextColor="#b3b3b3"
        />

        <TextInput
          style={styles.input}
          placeholder="Add a category"
          value={category}
          onChangeText={setCategory}
          placeholderTextColor="#b3b3b3"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Reason for Visit"
          value={reason}
          onChangeText={setReason}
          placeholderTextColor="#b3b3b3"
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder="dd/mm/yyyy"
          value={date}
          onChangeText={setDate}
          placeholderTextColor="#b3b3b3"
        />

        <TextInput
          style={styles.input}
          placeholder="-- : --"
          value={time}
          onChangeText={setTime}
          placeholderTextColor="#b3b3b3"
        />
      </View>

      {/* Save Appointment Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveAppointment}>
        <Text style={styles.saveButtonText}>Save Appointment</Text>
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
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  formContainer: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  textArea: {
    textAlignVertical: 'top',
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
