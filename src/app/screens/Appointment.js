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
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { SERVER_IP, SERVER_PORT } from '../config/constants';

const Appointment = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      
      if (!userId) {
        console.error('No user ID found in AsyncStorage');
        setLoading(false);
        return;
      }

      const url = `http://${SERVER_IP}/PetFurMe-Application/api/appointments/get_appointments.php?user_id=${userId}`;
      console.log('\n=== Client Debug Logs ===');
      console.log('User ID:', userId);
      console.log('Full URL:', url);
      console.log('SERVER_IP:', SERVER_IP);
      console.log('SERVER_PORT:', SERVER_PORT);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw appointments data:', data);
      
      if (!Array.isArray(data)) {
        console.error('Received non-array data:', data);
        throw new Error('Invalid data format received');
      }
      
      const activeAppointments = data.filter(appointment => !appointment.deleted_at);
      console.log('Filtered appointments:', activeAppointments);
      
      setAppointments(activeAppointments);
      setLoading(false);
    } catch (error) {
      console.error('\n=== Client Error Details ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      setLoading(false);
      setAppointments([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#E6F3FF';
      case 'completed':
        return '#E8E8E8';
      case 'cancelled':
        return '#FFE6E6';
      case 'no_show':
        return '#FF4444';
      default:
        return '#E8E8E8';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderAppointment = ({ item }) => {
    const isUpcoming = ['pending', 'confirmed'].includes(item.status);
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.petName}>{item.pet_name}</Text>
            <Text style={styles.petType}>{item.pet_type}</Text>
          </View>
          <Text style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(item.appointment_date)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={styles.detailText}>
              {formatTime(item.appointment_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="medical-outline" size={18} color="#666" />
            <Text style={styles.detailText}>
              {JSON.parse(item.reason_for_visit).join(', ')}
            </Text>
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
      <CustomHeader
        title="Appointments"
        subtitle="Manage your appointments"
        navigation={navigation}
        showBackButton={true}
        showDrawerButton={true}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8146C1" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomNavigation activeScreen="Appointments" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  petType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rescheduleButton: {
    backgroundColor: '#8146C1',
  },
  cancelButton: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelText: {
    color: '#FF4444',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#8146C1',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Appointment; 