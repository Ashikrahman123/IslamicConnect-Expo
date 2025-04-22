import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHijriCalendar, getIslamicSpecialDays } from '../api/islamicCalendar';

const screenWidth = Dimensions.get('window').width;

const IslamicCalendar = ({ onEventPress, compact = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [hijriMonth, setHijriMonth] = useState(null);
  const [hijriYear, setHijriYear] = useState(null);
  const [error, setError] = useState(null);

  // Helper function to create the days array for the calendar
  const createDaysArray = (calendarData) => {
    if (!calendarData || !calendarData.days) return [];
    
    // Create an array of all days in the month
    let days = [];
    const firstDayWeekday = new Date(calendarData.days[0].gregorian.date).getDay();
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push({ empty: true });
    }
    
    // Add the actual days
    calendarData.days.forEach(day => {
      const isSpecialDay = events.find(event => 
        event.day === parseInt(day.hijri.day) && 
        event.month === calendarData.month
      );
      
      days.push({
        ...day,
        isSpecialDay: !!isSpecialDay,
        specialDayInfo: isSpecialDay
      });
    });
    
    return days;
  };

  const loadCalendarData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current date to determine current Hijri month and year
      const today = new Date();
      const currentHijriDateResponse = await fetch('https://api.aladhan.com/v1/gToH?date=' + 
        today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear());
      const currentHijriData = await currentHijriDateResponse.json();
      
      if (currentHijriData.code === 200 && currentHijriData.data) {
        const hijriData = currentHijriData.data.hijri;
        const month = parseInt(hijriData.month.number);
        const year = parseInt(hijriData.year);
        
        setHijriMonth(month);
        setHijriYear(year);
        
        // Get calendar for current Hijri month
        const calendarData = await getHijriCalendar(year, month);
        setCalendar(calendarData);
        
        // Get Islamic special days
        const specialDays = getIslamicSpecialDays(year);
        setEvents(specialDays);
      } else {
        throw new Error('Failed to fetch current Hijri date');
      }
    } catch (err) {
      console.error('Error loading Islamic calendar:', err);
      setError('Could not load Islamic calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = async (increment) => {
    try {
      setIsLoading(true);
      
      let newMonth = hijriMonth + increment;
      let newYear = hijriYear;
      
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
      
      setHijriMonth(newMonth);
      setHijriYear(newYear);
      
      const calendarData = await getHijriCalendar(newYear, newMonth);
      setCalendar(calendarData);
      
      const specialDays = getIslamicSpecialDays(newYear);
      setEvents(specialDays);
    } catch (err) {
      console.error('Error changing month:', err);
      setError('Could not load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  if (compact) {
    // For compact view, show only the next few Islamic events
    return (
      <View style={styles.compactContainer}>
        <View style={styles.headerCompact}>
          <Text style={styles.compactTitle}>Upcoming Islamic Events</Text>
        </View>
        
        {isLoading ? (
          <ActivityIndicator size="small" color="#00ACC1" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.eventsContainer}>
            {events
              .filter(event => {
                // Filter to show only upcoming events in the next 2 months
                const eventMonth = event.month;
                const eventDay = event.day;
                
                // If this event is in current month but day has passed, skip it
                if (eventMonth === hijriMonth && eventDay < parseInt(calendar?.days[0]?.hijri.day || 0)) {
                  return false;
                }
                
                // If this event is in a month more than 2 months away, skip it
                const twoMonthsAhead = ((hijriMonth + 2) > 12) 
                  ? (hijriMonth + 2) - 12 
                  : (hijriMonth + 2);
                
                if (
                  (eventMonth > hijriMonth && eventMonth <= twoMonthsAhead) ||
                  (eventMonth === hijriMonth) ||
                  (twoMonthsAhead < hijriMonth && eventMonth <= twoMonthsAhead)
                ) {
                  return true;
                }
                
                return false;
              })
              .slice(0, 3) // Take only the first 3 upcoming events
              .map((event, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.compactEventItem}
                  onPress={() => onEventPress && onEventPress(event)}
                >
                  <View style={styles.eventIndicator} />
                  <View style={styles.eventTextContainer}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDate}>
                      {event.day} {getMonthName(event.month)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#00ACC1" />
                </TouchableOpacity>
              ))}
            
            {events.length === 0 && (
              <Text style={styles.noEventsText}>No upcoming Islamic events</Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // Full calendar view
  const days = createDaysArray(calendar);
  
  const renderCalendarDay = ({ item, index }) => {
    if (item.empty) {
      return <View style={styles.emptyDay} />;
    }
    
    const dayStyles = [styles.calendarDay];
    const textStyles = [styles.dayText];
    
    if (item.isSpecialDay) {
      dayStyles.push(styles.specialDay);
      textStyles.push(styles.specialDayText);
    }
    
    // Check if this is today
    const today = new Date();
    const isToday = item.gregorian.date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (isToday) {
      dayStyles.push(styles.todayDay);
      textStyles.push(styles.todayText);
    }
    
    return (
      <TouchableOpacity 
        style={dayStyles}
        onPress={() => item.isSpecialDay && onEventPress && onEventPress(item.specialDayInfo)}
      >
        <Text style={textStyles}>{item.hijri.day}</Text>
        <Text style={styles.gregorianDay}>{new Date(item.gregorian.date).getDate()}</Text>
        {item.isSpecialDay && (
          <View style={styles.eventDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => handleMonthChange(-1)}
        >
          <Ionicons name="chevron-back" size={24} color="#00ACC1" />
        </TouchableOpacity>
        
        <Text style={styles.monthYearText}>
          {getMonthName(hijriMonth)} {hijriYear} H
        </Text>
        
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => handleMonthChange(1)}
        >
          <Ionicons name="chevron-forward" size={24} color="#00ACC1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekdaysRow}>
        <Text style={styles.weekdayText}>Sun</Text>
        <Text style={styles.weekdayText}>Mon</Text>
        <Text style={styles.weekdayText}>Tue</Text>
        <Text style={styles.weekdayText}>Wed</Text>
        <Text style={styles.weekdayText}>Thu</Text>
        <Text style={styles.weekdayText}>Fri</Text>
        <Text style={styles.weekdayText}>Sat</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#00ACC1" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={days}
            renderItem={renderCalendarDay}
            keyExtractor={(item, index) => index.toString()}
            numColumns={7}
            scrollEnabled={false}
            style={styles.calendarGrid}
          />
          
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>Islamic Events This Month</Text>
            
            {events
              .filter(event => event.month === hijriMonth)
              .map((event, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.eventItem}
                  onPress={() => onEventPress && onEventPress(event)}
                >
                  <View style={styles.eventIndicator} />
                  <View style={styles.eventTextContainer}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDate}>{event.day} {getMonthName(event.month)}</Text>
                  </View>
                  <Ionicons name="information-circle-outline" size={24} color="#00ACC1" />
                </TouchableOpacity>
              ))}
              
            {events.filter(event => event.month === hijriMonth).length === 0 && (
              <Text style={styles.noEventsText}>No Islamic events this month</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
};

// Helper function to get Hijri month name
const getMonthName = (monthNumber) => {
  const months = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  return months[monthNumber - 1] || '';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerCompact: {
    marginBottom: 12,
  },
  monthButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  weekdayText: {
    fontSize: 12,
    color: '#718096',
    width: (screenWidth - 32) / 7,
    textAlign: 'center',
  },
  calendarGrid: {
    marginBottom: 16,
  },
  calendarDay: {
    width: (screenWidth - 32) / 7,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyDay: {
    width: (screenWidth - 32) / 7,
    height: 48,
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  gregorianDay: {
    fontSize: 10,
    color: '#718096',
    marginTop: 2,
  },
  specialDay: {
    backgroundColor: '#F0F9FA',
    borderRadius: 4,
  },
  specialDayText: {
    color: '#00ACC1',
  },
  todayDay: {
    backgroundColor: '#00ACC1',
    borderRadius: 24,
    width: 40,
    height: 40,
  },
  todayText: {
    color: '#FFFFFF',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ACC1',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 8,
    color: '#718096',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  errorText: {
    marginTop: 8,
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
  },
  eventsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  compactEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  eventIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#43A047',
    marginRight: 12,
  },
  eventTextContainer: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  eventDate: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#718096',
    paddingVertical: 20,
  },
  loader: {
    marginVertical: 20,
  },
  eventsContainer: {
    marginTop: 8,
  },
});

export default IslamicCalendar;