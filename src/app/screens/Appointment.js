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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAllAppointments, setShowAllAppointments] = useState(false);

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
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getMarkedDates = () => {
    const marked = {};
    appointments.forEach(appointment => {
      const date = appointment.appointment_date.split(' ')[0];
      marked[date] = {
        marked: true,
        dotColor: '#8146C1',
        selected: date === selectedDate.toISOString().split('T')[0],
        selectedColor: '#8146C1'
      };
    });
    return marked;
  };

  const filterAppointmentsByDate = (date) => {
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
      const selectedDateString = date.toISOString().split('T')[0];
      return appointmentDate === selectedDateString;
    });
    return filtered;
  };

  const getTodayDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const toggleAppointmentsView = () => {
    setShowAllAppointments(!showAllAppointments);
  };

  const renderAppointment = ({ item }) => {
    const isUpcoming = ['pending', 'confirmed'].includes(item.status);
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.petName}>{item.pet_name}</Text>
          </View>
          <Text style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
            styles.statusText
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={18} color="#8146C1" />
            </View>
            <Text style={styles.detailText}>
              {formatDate(item.appointment_date)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={18} color="#8146C1" />
            </View>
            <Text style={styles.detailText}>
              {formatTime(item.appointment_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical-outline" size={18} color="#8146C1" />
            </View>
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

  const renderCalendar = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const isSelected = dateString === selectedDate.toISOString().split('T')[0];
      
      const today = getTodayDate();
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      
      const appointmentForDay = appointments.find(app => {
        const appDate = new Date(app.appointment_date).toISOString().split('T')[0];
        return appDate === dateString;
      });
      
      const hasAppointment = Boolean(appointmentForDay);
      const appointmentStatus = appointmentForDay?.status;

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.calendarDay,
            hasAppointment && styles.appointmentDay,
            hasAppointment && isPast && styles.pastAppointmentDay,
            isSelected && styles.selectedDay,
            isPast && styles.pastDay,
            isToday && styles.todayDay
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.calendarDayText,
            hasAppointment && styles.appointmentDayText,
            hasAppointment && isPast && styles.pastAppointmentDayText,
            isSelected && styles.selectedDayText,
            isPast && styles.pastDayText,
            isToday && styles.todayText
          ]}>{i}</Text>
          {hasAppointment && (
            <View style={[
              styles.appointmentIndicator,
              isPast && styles.pastAppointmentIndicator,
              appointmentStatus === 'cancelled' && styles.cancelledAppointmentIndicator,
              isToday && styles.todayAppointmentIndicator
            ]}>
              <Ionicons 
                name={isPast ? "checkmark" : "calendar"} 
                size={10} 
                color="#FFF" 
              />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.monthNavigationButton} 
              onPress={() => {
                const newDate = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
                setCurrentMonth(newDate);
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#8146C1" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity 
              style={styles.monthNavigationButton}
              onPress={() => {
                const newDate = new Date(currentMonth.setMonth(currentMonth.getMonth() + 1));
                setCurrentMonth(newDate);
              }}
            >
              <Ionicons name="chevron-forward" size={24} color="#8146C1" />
            </TouchableOpacity>
          </View>
          <View style={styles.weekdayHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {days}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={toggleAppointmentsView}
        >
          <Ionicons 
            name={showAllAppointments ? "calendar" : "list"} 
            size={16} 
            color="#8146C1" 
          />
          <Text style={styles.toggleText}>
            {showAllAppointments ? "Show Calendar View" : "Show All Appointments"}
          </Text>
        </TouchableOpacity>
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
        <View style={styles.mainContent}>
          <FlatList
            data={showAllAppointments ? appointments : filterAppointmentsByDate(selectedDate)}
            renderItem={renderAppointment}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderCalendar}
          />
        </View>
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
  mainContent: {
    flex: 1,
  },
  calendarWrapper: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarContainer: {
    overflow: 'hidden',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8F0FF',
  },
  monthNavigationButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
    backgroundColor: '#FFFFFF',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
    position: 'relative',
    paddingBottom: 14,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 2,
  },
  appointmentDay: {
    backgroundColor: '#F8F0FF',
    borderRadius: 6,
  },
  appointmentDayText: {
    color: '#8146C1',
    fontWeight: '600',
  },
  pastDay: {
    opacity: 0.6,
  },
  pastDayText: {
    color: '#999',
  },
  pastAppointmentDay: {
    backgroundColor: '#F5F5F5',
  },
  pastAppointmentDayText: {
    color: '#666',
  },
  selectedDay: {
    backgroundColor: '#8146C1',
    borderRadius: 6,
    transform: [{ scale: 1.05 }],
    elevation: 2,
    shadowColor: '#8146C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 0,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  appointmentIndicator: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: '#8146C1',
    borderRadius: 3,
    padding: 2,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastAppointmentIndicator: {
    backgroundColor: '#999',
  },
  cancelledAppointmentIndicator: {
    backgroundColor: '#FF4444',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flex: 1,
  },
  petName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C3E50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: '600',
  },
  statusText: {
    color: '#2C3E50',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#F8F0FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#4A5568',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
    fontWeight: '600',
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
  listContainer: {
    flexGrow: 1,
    paddingBottom: 90,
  },
  todayDay: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  todayText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  todayAppointmentIndicator: {
    backgroundColor: '#4CAF50',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  toggleText: {
    color: '#8146C1',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Appointment; 