import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { SERVER_IP, SERVER_PORT } from '../config/constants';

const CustomAlert = ({ visible, title, message, onConfirm, onCancel }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.alertOverlay}>
      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <View style={styles.alertButtons}>
          <TouchableOpacity 
            style={[styles.alertButton, styles.alertCancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.alertButtonText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.alertButton, styles.alertConfirmButton]}
            onPress={onConfirm}
          >
            <Text style={[styles.alertButtonText, styles.alertConfirmText]}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Appointment = ({ navigation, route }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get user_id from route params or AsyncStorage
        const routeUserId = route.params?.user_id;
        const storedUserId = await AsyncStorage.getItem('user_id');
        const currentUserId = routeUserId || storedUserId;

        if (!currentUserId) {
          console.error('No user ID found');
          navigation.replace('LoginScreen');
          return;
        }

        // Store the current user_id
        await AsyncStorage.setItem('user_id', currentUserId.toString());

        // Fetch appointments
        await fetchAppointments(currentUserId);

      } catch (error) {
        console.error('Session check error:', error);
        navigation.replace('LoginScreen');
      }
    };

    checkSession();
  }, [route.params?.user_id]); // Only depend on user_id changes

  useEffect(() => {
    // Get appointments when the screen loads or when forceRefresh is passed
    if (route.params?.forceRefresh) {
      console.log('Force refreshing appointments due to rescheduling');
      // Get the user ID from AsyncStorage or route params
      AsyncStorage.getItem('user_id')
        .then(storedUserId => {
          const currentUserId = route.params?.user_id || storedUserId;
          if (currentUserId) {
            fetchAppointments(currentUserId);
          } else {
            console.error('No user ID available for refreshing appointments');
          }
        })
        .catch(error => {
          console.error('Error getting user ID for refresh:', error);
        });
    }
  }, [route.params?.forceRefresh, route.params?.timestamp]);

  const fetchAppointments = async (userId) => {
    try {
      setLoading(true);
      
      if (!userId) {
        throw new Error('No user ID available');
      }

      const url = `http://${SERVER_IP}/PetFurMe-Application/api/appointments/get_appointments.php?user_id=${userId}`;
      console.log('\n=== Fetching Appointments ===');
      console.log('User ID:', userId);
      console.log('Request URL:', url);

      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Appointments data received:', data);
      
      if (Array.isArray(data)) {
        const activeAppointments = data.filter(appointment => {
          console.log('Processing appointment:', {
            id: appointment.id,
            status: appointment.status,
            deleted_at: appointment.deleted_at
          });
          return !appointment.deleted_at;
        });
        
        console.log('Active appointments:', activeAppointments);
        setAppointments(activeAppointments);
      } else {
        console.error('Invalid appointments data format:', data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
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
      case 'missed':
        return '#FF4444';
      default:
        return '#E8E8E8';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC'
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
      const appointmentDate = new Date(appointment.appointment_date);
      const appointmentDateString = appointmentDate.toLocaleDateString();
      
      const selectedDateString = date.toLocaleDateString();
      
      return appointmentDateString === selectedDateString;
    });
    return filtered;
  };

  const getTodayDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const toggleAppointmentsView = () => {
    setShowAllAppointments(!showAllAppointments);
  };

  const handleReschedule = (appointment) => {
    navigation.navigate('Consultation', {
      user_id: appointment.user_id,
      isRescheduling: true,
      originalAppointment: appointment
    });
  };

  const handleCancel = async (appointmentId) => {
    console.log('handleCancel called with ID:', appointmentId);
    if (!appointmentId) {
      console.error('No appointment ID provided to handleCancel');
      return;
    }

    try {
      setLoading(true);
      console.log('\n=== Cancel Appointment Debug ===');
      console.log('Starting cancellation for appointment:', appointmentId);
      
      const url = `http://${SERVER_IP}/PetFurMe-Application/api/appointments/update_status.php`;
      console.log('Cancel API URL:', url);

      const requestBody = {
        appointment_id: appointmentId,
        status: 'cancelled'
      };
      console.log('Cancel request body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Cancel response status:', response.status);
      const responseText = await response.text();

      const result = JSON.parse(responseText);
      console.log('Parsed response:', result);

      if (result.success) {
        // Update local state
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );

        // Show success message and refresh
        Alert.alert(
          'Success',
          'Appointment cancelled successfully',
          [
            {
              text: 'OK',
              onPress: () => fetchAppointments(result.user_id) // Refresh the list
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert(
        'Error',
        'Failed to cancel appointment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = () => {
    // Get user_id from AsyncStorage instead of route params since we already have it
    AsyncStorage.getItem('user_id').then(user_id => {
      if (!user_id) {
        Alert.alert('Error', 'Please login to book an appointment');
        navigation.navigate('LoginScreen');
        return;
      }

      // Add timestamp to the navigation params
      const timestamp = Date.now();

      // Navigate to Consultation with the user_id and timestamp
      navigation.navigate('Consultation', {
        user_id: user_id,
        timestamp: timestamp
      });
    }).catch(error => {
      console.error('Error getting user_id:', error);
      Alert.alert('Error', 'Please login to book an appointment');
      navigation.navigate('LoginScreen');
    });
  };

  const handleCancelPress = (appointmentId) => {
    console.log('Cancel button pressed for appointment:', appointmentId);
    setSelectedAppointmentId(appointmentId);
    
    if (Platform.OS === 'web') {
      setShowAlert(true);
    } else {
      Alert.alert(
        "Cancel Appointment",
        "Are you sure you want to cancel this appointment?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => console.log('Cancellation declined')
          },
          {
            text: "Yes",
            style: "destructive",
            onPress: () => handleCancel(appointmentId)
          }
        ],
        {
          cancelable: true,
          onDismiss: () => console.log('Alert dismissed')
        }
      );
    }
  };

  const renderAppointment = ({ item }) => {
    const isPending = item.status === 'pending';
    const isUpcoming = ['pending', 'confirmed'].includes(item.status);
    const appointmentDateTime = new Date(`${item.appointment_date} ${item.appointment_time}`);
    const now = new Date();
    const isPast = appointmentDateTime < now;
    
    console.log('Rendering appointment card:', {
      id: item.id,
      status: item.status,
      isPending,
      isUpcoming,
      isPast,
      appointmentDateTime: appointmentDateTime.toISOString(),
      now: now.toISOString()
    });
    
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
            {item.status === 'missed' ? 'Missed Appointment' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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

        {isUpcoming && !isPast && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.rescheduleButton,
                !isPending && styles.disabledButton
              ]}
              onPress={() => isPending && handleReschedule(item)}
              disabled={!isPending}
            >
              <Text style={[
                styles.buttonText,
                !isPending && styles.disabledButtonText
              ]}>Reschedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.cancelButton,
                !isPending && styles.disabledButton
              ]}
              onPress={() => isPending && handleCancelPress(item.id)}
              disabled={!isPending}
            >
              <Text style={[
                styles.buttonText,
                styles.cancelText,
                !isPending && styles.disabledButtonText
              ]}>Cancel</Text>
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
      const dateString = date.toLocaleDateString();
      const selectedDateString = selectedDate.toLocaleDateString();
      const isSelected = dateString === selectedDateString;
      
      const today = getTodayDate();
      const todayString = today.toLocaleDateString();
      const isToday = dateString === todayString;
      const isPast = date < today;
      
      const appointmentForDay = appointments.find(app => {
        const appDate = new Date(app.appointment_date);
        return appDate.toLocaleDateString() === dateString;
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
        style={styles.addButton}
        onPress={handleAddAppointment}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>New Appointment</Text>
      </TouchableOpacity>

      <BottomNavigation activeScreen="Appointments" />

      <CustomAlert
        visible={showAlert}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        onConfirm={() => {
          setShowAlert(false);
          if (selectedAppointmentId) {
            handleCancel(selectedAppointmentId);
          }
        }}
        onCancel={() => {
          setShowAlert(false);
          console.log('Cancellation declined');
        }}
      />
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
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    backgroundColor: '#8146C1',
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 15,
    zIndex: 1000,
    paddingHorizontal: 16,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 120,
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
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  alertCancelButton: {
    backgroundColor: '#E5E7EB',
  },
  alertConfirmButton: {
    backgroundColor: '#FF4444',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertConfirmText: {
    color: 'white',
  },
});

export default Appointment; 