import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPrayerTimes } from '../api/prayerTimes';

const PrayerTimesWidget = ({ 
  onPress, 
  compact = false,
  location = { latitude: 37.7749, longitude: -122.4194 }, // Default to San Francisco
  refreshTrigger = null
}) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrayerTimes = async () => {
    try {
      setIsLoading(true);
      
      const todayPrayerTimes = await getPrayerTimes(
        new Date(),
        location.latitude,
        location.longitude
      );
      
      setPrayerTimes(todayPrayerTimes);
      setError(null);
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError('Could not load prayer times');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, [location, refreshTrigger]);

  // Find the next prayer time
  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const prayers = [
      { name: 'Fajr', time: prayerTimes.timings.fajr },
      { name: 'Dhuhr', time: prayerTimes.timings.dhuhr },
      { name: 'Asr', time: prayerTimes.timings.asr },
      { name: 'Maghrib', time: prayerTimes.timings.maghrib },
      { name: 'Isha', time: prayerTimes.timings.isha }
    ];
    
    // Convert HH:MM times to minutes for comparison
    const prayerMinutes = prayers.map(prayer => {
      const [hoursStr, minutesStr] = prayer.time.split(':');
      const hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);
      return {
        ...prayer,
        totalMinutes: hours * 60 + minutes
      };
    });
    
    // Find the next prayer
    const nextPrayer = prayerMinutes.find(prayer => prayer.totalMinutes > currentTime);
    
    if (nextPrayer) {
      return nextPrayer;
    } else {
      // If all prayers for today have passed, return the first prayer of tomorrow
      return { ...prayerMinutes[0], isTomorrow: true };
    }
  };

  const nextPrayer = getNextPrayer();

  // Formats the time from 24hr to 12hr format
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer}
        onPress={onPress}
        disabled={isLoading || error}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#00ACC1" />
        ) : error ? (
          <View style={styles.compactContent}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>Prayer times unavailable</Text>
          </View>
        ) : (
          <View style={styles.compactContent}>
            <Text style={styles.nextPrayerLabel}>
              {nextPrayer?.isTomorrow ? 'Tomorrow\'s Fajr:' : `Next: ${nextPrayer?.name}`}
            </Text>
            <Text style={styles.nextPrayerTime}>{formatTime(nextPrayer?.time)}</Text>
            <Ionicons name="chevron-forward" size={18} color="#00ACC1" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={isLoading || error}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        {!isLoading && !error && (
          <TouchableOpacity onPress={fetchPrayerTimes} style={styles.refreshButton}>
            <Ionicons name="refresh" size={18} color="#00ACC1" />
          </TouchableOpacity>
        )}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00ACC1" />
          <Text style={styles.loadingText}>Loading prayer times...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={22} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View>
          <View style={styles.nextPrayerContainer}>
            <Text style={styles.nextPrayerTitle}>
              {nextPrayer?.isTomorrow ? 'Tomorrow\'s First Prayer' : 'Next Prayer'}
            </Text>
            <View style={styles.nextPrayerInfo}>
              <Text style={styles.nextPrayerName}>{nextPrayer?.name}</Text>
              <Text style={styles.nextPrayerTime}>{formatTime(nextPrayer?.time)}</Text>
            </View>
          </View>
          
          <View style={styles.prayerTimesContainer}>
            <View style={styles.prayerTime}>
              <Text style={styles.prayerName}>Fajr</Text>
              <Text style={[
                styles.prayerTimeText,
                nextPrayer?.name === 'Fajr' && !nextPrayer?.isTomorrow && styles.highlightedPrayer
              ]}>
                {formatTime(prayerTimes?.timings.fajr)}
              </Text>
            </View>
            
            <View style={styles.prayerTime}>
              <Text style={styles.prayerName}>Dhuhr</Text>
              <Text style={[
                styles.prayerTimeText,
                nextPrayer?.name === 'Dhuhr' && styles.highlightedPrayer
              ]}>
                {formatTime(prayerTimes?.timings.dhuhr)}
              </Text>
            </View>
            
            <View style={styles.prayerTime}>
              <Text style={styles.prayerName}>Asr</Text>
              <Text style={[
                styles.prayerTimeText,
                nextPrayer?.name === 'Asr' && styles.highlightedPrayer
              ]}>
                {formatTime(prayerTimes?.timings.asr)}
              </Text>
            </View>
            
            <View style={styles.prayerTime}>
              <Text style={styles.prayerName}>Maghrib</Text>
              <Text style={[
                styles.prayerTimeText,
                nextPrayer?.name === 'Maghrib' && styles.highlightedPrayer
              ]}>
                {formatTime(prayerTimes?.timings.maghrib)}
              </Text>
            </View>
            
            <View style={styles.prayerTime}>
              <Text style={styles.prayerName}>Isha</Text>
              <Text style={[
                styles.prayerTimeText,
                nextPrayer?.name === 'Isha' && styles.highlightedPrayer
              ]}>
                {formatTime(prayerTimes?.timings.isha)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
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
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#718096',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#718096',
    fontSize: 14,
    marginLeft: 6,
  },
  nextPrayerContainer: {
    backgroundColor: '#F0F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  nextPrayerTitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 6,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ACC1',
  },
  nextPrayerTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: '#718096',
    marginRight: 8,
  },
  prayerTimesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  prayerTime: {
    alignItems: 'center',
    width: '20%',
    marginVertical: 8,
  },
  prayerName: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  prayerTimeText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  highlightedPrayer: {
    color: '#00ACC1',
    fontWeight: 'bold',
  },
});

export default PrayerTimesWidget;