import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMonthlyPrayerTimes } from '../../api/prayerTimes';
import PrayerTimesWidget from '../../components/PrayerTimesWidget';

const PrayerTimesScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyPrayerTimes, setMonthlyPrayerTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  
  // Default location (San Francisco) - in a real app, this would come from device location or user settings
  const location = { 
    latitude: 37.7749,
    longitude: -122.4194
  };

  const loadPrayerTimes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const now = new Date();
      const month = now.getMonth() + 1; // JavaScript months are 0-based
      const year = now.getFullYear();
      
      const prayerTimesData = await getMonthlyPrayerTimes(
        year,
        month,
        location.latitude,
        location.longitude
      );
      
      setMonthlyPrayerTimes(prayerTimesData);
      
    } catch (err) {
      console.error('Error loading prayer times:', err);
      setError('Could not load prayer times data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPrayerTimes();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSetLocation = () => {
    // In a real app, this would open a map or location picker
    Alert.alert(
      "Set Location",
      "This feature would allow you to set your location for accurate prayer times.",
      [
        { text: "OK" }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ACC1" />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Times</Text>
        <TouchableOpacity 
          onPress={handleSetLocation}
          style={styles.locationButton}
        >
          <Ionicons name="location-outline" size={24} color="#00ACC1" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadPrayerTimes}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Today's Prayer Times */}
            <View style={styles.todayContainer}>
              <Text style={styles.todayTitle}>Today's Prayer Times</Text>
              <PrayerTimesWidget 
                location={location}
                refreshTrigger={refreshing}
              />
            </View>
            
            {/* Monthly Prayer Times */}
            <View style={styles.monthlyContainer}>
              <Text style={styles.monthlyTitle}>Monthly Schedule</Text>
              
              {monthlyPrayerTimes.length > 0 ? (
                monthlyPrayerTimes.map((dayData, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.dayItem,
                      new Date(dayData.date.gregorian.date).toDateString() === new Date().toDateString() && 
                        styles.currentDayItem
                    ]}
                  >
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateText}>
                        {formatDate(dayData.date.gregorian.date)}
                      </Text>
                      <Text style={styles.hijriDateText}>
                        {dayData.date.hijri.day} {dayData.date.hijri.month.en}
                      </Text>
                    </View>
                    
                    <View style={styles.timesContainer}>
                      <View style={styles.prayerTimeItem}>
                        <Text style={styles.prayerName}>Fajr</Text>
                        <Text style={styles.prayerTime}>{dayData.timings.Fajr.split(' ')[0]}</Text>
                      </View>
                      
                      <View style={styles.prayerTimeItem}>
                        <Text style={styles.prayerName}>Dhuhr</Text>
                        <Text style={styles.prayerTime}>{dayData.timings.Dhuhr.split(' ')[0]}</Text>
                      </View>
                      
                      <View style={styles.prayerTimeItem}>
                        <Text style={styles.prayerName}>Asr</Text>
                        <Text style={styles.prayerTime}>{dayData.timings.Asr.split(' ')[0]}</Text>
                      </View>
                      
                      <View style={styles.prayerTimeItem}>
                        <Text style={styles.prayerName}>Maghrib</Text>
                        <Text style={styles.prayerTime}>{dayData.timings.Maghrib.split(' ')[0]}</Text>
                      </View>
                      
                      <View style={styles.prayerTimeItem}>
                        <Text style={styles.prayerName}>Isha</Text>
                        <Text style={styles.prayerTime}>{dayData.timings.Isha.split(' ')[0]}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No prayer times data available for this month</Text>
              )}
            </View>
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 10,
    color: '#2C3E50',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  backButton: {
    padding: 8,
  },
  locationButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
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
  todayContainer: {
    marginBottom: 24,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  monthlyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  dayItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
  },
  currentDayItem: {
    backgroundColor: '#F0F9FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00ACC1',
    paddingHorizontal: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  hijriDateText: {
    fontSize: 14,
    color: '#718096',
  },
  timesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  prayerTimeItem: {
    alignItems: 'center',
    width: '20%', // 5 prayers per row
  },
  prayerName: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  noDataText: {
    textAlign: 'center',
    color: '#718096',
    paddingVertical: 20,
  },
});

export default PrayerTimesScreen;