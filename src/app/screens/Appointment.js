import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';

const Appointment = ({ route, navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user_id } = route.params || {};

  // Mock data - Replace this with actual API call
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setAppointments([
        {
          id: '1',
          doctorName: 'Dr. Sarah Smith',
          specialty: 'Cardiologist',
          date: '2024-03-25',
          time: '10:00 AM',
          status: 'upcoming'
        },
        {
          id: '2',
          doctorName: 'Dr. John Doe',
          specialty: 'Dermatologist',
          date: '2024-03-20',
          time: '2:30 PM',
          status: 'completed'
        },
        // Add more mock appointments as needed
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderAppointment = ({ item }) => {
    const isUpcoming = item.status === 'upcoming';
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={[
            styles.statusBadge,
            { backgroundColor: isUpcoming ? '#E6F3FF' : '#E8E8E8' }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        
        <Text style={styles.specialty}>{item.specialty}</Text>
        
        <View style={styles.appointmentDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color="#8146C1" />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color="#8146C1" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
        </View>

        {isUpcoming && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.rescheduleButton]}
              onPress={() => {/* Handle reschedule */}}
            >
              <Text style={styles.buttonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => {/* Handle cancel */}}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>
        <TouchableOpacity 
          style={styles.newAppointmentButton}
          onPress={() => {/* Handle new appointment */}}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8146C1" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <BottomNavigation activeScreen="Appointment" user_id={user_id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  newAppointmentButton: {
    backgroundColor: '#8146C1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  specialty: {
    color: '#666666',
    marginBottom: 12,
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    color: '#666666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  rescheduleButton: {
    backgroundColor: '#8146C1',
  },
  cancelButton: {
    backgroundColor: '#FFF0F0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cancelText: {
    color: '#FF4444',
  },
});

export default Appointment; 