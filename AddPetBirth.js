import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

const PetBirthdaySelection = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // January index
  const [selectedDay, setSelectedDay] = useState(null);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = Array.from({ length: 50 }, (_, i) => (2025 - i).toString());

  const daysInMonth = (monthIndex, year) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const days = Array.from(
    { length: daysInMonth(selectedMonthIndex, selectedYear) },
    (_, i) => i + 1
  );

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderMonth = ({ item }) => (
    <View style={styles.monthContainer}>
      <Text style={styles.monthText}>{item}</Text>

      {/* Weekday Names */}
      <View style={styles.weekdaysContainer}>
        {weekdays.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Days */}
      <FlatList
        data={days}
        keyExtractor={(day) => day.toString()}
        numColumns={7}
        contentContainerStyle={styles.calendarContainer}
        renderItem={({ item: day }) => (
          <TouchableOpacity
            style={[
              styles.dayBox,
              selectedDay === day && styles.selectedDayBox,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={selectedDay === day ? styles.selectedDayText : styles.dayText}>
              {day}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#b3b3b3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Pet Profile</Text>
        <Text style={styles.birth}>Birthday</Text>
        <Text style={styles.headerStep}>Step 5/5</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar} />
      </View>

      {/* Calendar Icon and Birth Date Label */}
      <View style={styles.dateHeader}>
        <Ionicons name="calendar" size={30} color="#8146C1" style={styles.calendarIcon} />
        <Text style={styles.dateTitle}>Birth Date</Text>
      </View>

      {/* Dropdown for Year */}
      <RNPickerSelect
        onValueChange={(value) => setSelectedYear(value)}
        items={years.map((year) => ({ label: year, value: year }))}
        value={selectedYear}
        style={pickerSelectStyles}
      />

      {/* Swipeable Month Display */}
      <FlatList
        data={months}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
          );
          setSelectedMonthIndex(index);
        }}
        renderItem={renderMonth}
        contentContainerStyle={styles.monthListContainer}
      />

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton}>
        <Text style={styles.doneButtonText} onPress={() => navigation.navigate('HomePage')}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8146C1',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    top: 38,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 70,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    top: 45,
  },
  birth: {
    color: '#b3b3b3',
    fontSize: 14,
    position: 'absolute',
    top: 85,
    left: 155,
  },
  headerStep: {
    color: '#808080',
    fontSize: 12,
    position: 'absolute',
    right: 5,
    top: 75,
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    height: 4,
    marginTop: 5,
    borderRadius: 2,
  },
  progressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8146C1',
    borderRadius: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  calendarIcon: {
    marginRight: 10,
    top: 80,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8146C1',
    top: 80,
  },
  monthListContainer: {
    marginVertical: 20,
  },
  monthContainer: {
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#EDE7F6',
    marginHorizontal: 30,
    marginBottom: 0,
    paddingVertical: 10,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8146C1',
    textAlign: 'center',
    width: 40,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8146C1',
    textAlign: 'center',
    marginBottom: 20,
  },
  calendarContainer: {
    paddingHorizontal: 1,
    alignItems: 'center',
  },
  dayBox: {
    width: 40,
    height: 40,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  selectedDayBox: {
    backgroundColor: '#D382F6',
  },
  dayText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedDayText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  doneButton: {
    width: '90%',
    backgroundColor: '#CC38F2',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute', 
    top: 700, 
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#C597DB',
    borderRadius: 25,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#ffb3ff',
    marginBottom: 20,
    width: 120,
    height: 50,
  },
  inputAndroid: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#C597DB',
    borderRadius: 25,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#ffb3ff',
    marginBottom: 25,
    marginTop: 100,
    width: 120,
    height: 50,
    left: 120,
  },
});

export default PetBirthdaySelection;
