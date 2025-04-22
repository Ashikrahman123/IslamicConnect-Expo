import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getHijriCalendar, getCurrentHijriDate, getIslamicSpecialDays } from '../../api/islamicCalendar';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
];

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hijriYear, setHijriYear] = useState(null);
  const [hijriMonth, setHijriMonth] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [specialEvents, setSpecialEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First get current Hijri date
      const currentHijriDate = await getCurrentHijriDate();
      const currentHijriYear = parseInt(currentHijriDate.hijri.year);
      const currentHijriMonth = parseInt(currentHijriDate.hijri.month.number);
      
      setHijriYear(currentHijriYear);
      setHijriMonth(currentHijriMonth);
      
      // Get calendar for current month
      await fetchMonthCalendar(currentHijriYear, currentHijriMonth);
      
      // Get special Islamic events for the year
      const events = getIslamicSpecialDays(currentHijriYear);
      setSpecialEvents(events);
      
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Could not load calendar data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMonthCalendar = async (year, month) => {
    try {
      // Get Hijri calendar for a specific month
      const calendarData = await getHijriCalendar(year, month);
      
      if (calendarData && Array.isArray(calendarData)) {
        // Format data for calendar grid
        const daysInMonth = calendarData.map(day => ({
          date: day.hijri.day,
          gregorianDate: day.gregorian.date,
          weekday: new Date(day.gregorian.date).getDay(),
          isToday: day.hijri.date === calendarData.find(d => d.hijri.date === day.date)?.hijri.date
        }));
        
        // Add empty slots for days before first day of month
        const firstDayOfMonth = daysInMonth[0].weekday;
        const emptyDaysBefore = Array(firstDayOfMonth).fill(null).map((_, i) => ({ isEmpty: true, id: `empty-before-${i}` }));
        
        // Combine empty slots and actual days
        setCalendarDays([...emptyDaysBefore, ...daysInMonth]);
      }
    } catch (err) {
      console.error('Error fetching month calendar:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const changeMonth = async (increment) => {
    let newMonth = hijriMonth + increment;
    let newYear = hijriYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setHijriYear(newYear);
    setHijriMonth(newMonth);
    
    try {
      setIsLoading(true);
      await fetchMonthCalendar(newYear, newMonth);
      
      // Update special events if year changes
      if (newYear !== hijriYear) {
        const events = getIslamicSpecialDays(newYear);
        setSpecialEvents(events);
      }
    } catch (err) {
      setError('Could not change month. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCalendarData();
  };

  // Find special events for the current month
  const currentMonthEvents = specialEvents.filter(event => event.month === hijriMonth);

  // Render calendar day
  const renderDay = ({ item, index }) => {
    if (item.isEmpty) {
      return <View style={styles.emptyDay} />;
    }
    
    // Check if this day has a special event
    const hasEvent = currentMonthEvents.some(event => parseInt(event.day) === parseInt(item.date));
    
    return (
      <TouchableOpacity 
        style={[
          styles.dayContainer,
          item.isToday && styles.todayContainer,
          hasEvent && styles.eventDayContainer
        ]}
      >
        <Text 
          style={[
            styles.dayText,
            item.isToday && styles.todayText,
            hasEvent && styles.eventDayText
          ]}
        >
          {item.date}
        </Text>
        {hasEvent && (
          <View style={styles.eventIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Islamic Calendar</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ACC1" />
            <Text style={styles.loadingText}>Loading calendar...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchCalendarData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.calendarContainer}>
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <TouchableOpacity 
                style={styles.monthChangeButton}
                onPress={() => changeMonth(-1)}
              >
                <Ionicons name="chevron-back" size={24} color="#00ACC1" />
              </TouchableOpacity>
              
              <Text style={styles.monthTitle}>
                {MONTHS[hijriMonth - 1]} {hijriYear}
              </Text>
              
              <TouchableOpacity 
                style={styles.monthChangeButton}
                onPress={() => changeMonth(1)}
              >
                <Ionicons name="chevron-forward" size={24} color="#00ACC1" />
              </TouchableOpacity>
            </View>
            
            {/* Weekday Header */}
            <View style={styles.weekdaysContainer}>
              {WEEKDAYS.map((day, index) => (
                <View key={index} style={styles.weekdayContainer}>
                  <Text style={[
                    styles.weekdayText,
                    index === 5 && styles.fridayText, // Friday
                    index === 6 && styles.saturdayText // Saturday
                  ]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Calendar Grid */}
            <FlatList
              data={calendarDays}
              renderItem={renderDay}
              keyExtractor={(item, index) => 
                item.isEmpty ? item.id : `day-${item.date}-${index}`
              }
              numColumns={7}
              scrollEnabled={false}
              style={styles.calendarGrid}
            />
            
            {/* Special Events */}
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>
                Special Events in {MONTHS[hijriMonth - 1]}
              </Text>
              
              {currentMonthEvents.length > 0 ? (
                currentMonthEvents.map((event, index) => (
                  <View key={index} style={styles.eventItem}>
                    <View style={styles.eventDateContainer}>
                      <Text style={styles.eventDateText}>{event.day}</Text>
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      <Text style={styles.eventDescription}>{event.description}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noEventsText}>
                  No special events this month
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#2C3E50',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    color: '#2C3E50',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#00ACC1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthChangeButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingVertical: 12,
  },
  weekdayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  fridayText: {
    color: '#43A047', // Green for Friday
    fontWeight: 'bold',
  },
  saturdayText: {
    color: '#00ACC1', // Primary color for Saturday
  },
  calendarGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 8,
  },
  emptyDay: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
  },
  dayContainer: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 8,
  },
  todayContainer: {
    backgroundColor: '#00ACC1',
  },
  eventDayContainer: {
    backgroundColor: '#F0F9FA',
  },
  dayText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventDayText: {
    color: '#00ACC1',
    fontWeight: 'bold',
  },
  eventIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00ACC1',
    marginTop: 2,
  },
  eventsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginTop: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  eventDateContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ACC1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#718096',
  },
  noEventsText: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default CalendarScreen;