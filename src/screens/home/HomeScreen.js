import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getCurrentHijriDate } from '../../api/islamicCalendar';
import PrayerTimesWidget from '../../components/PrayerTimesWidget';
import { getFeaturedAudioContent } from '../../api/audioContent';

const HomeScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hijriDate, setHijriDate] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [featuredAudio, setFeaturedAudio] = useState([]);
  const [error, setError] = useState(null);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current Hijri date
      const hijriDateData = await getCurrentHijriDate();
      setHijriDate(hijriDateData);
      
      // We no longer need to fetch prayer times directly here since the PrayerTimesWidget will handle it
      
      // Get featured audio content
      const audioContent = await getFeaturedAudioContent(3);
      setFeaturedAudio(audioContent);
      
    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Could not load home data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ACC1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Assalamu Alaikum, {userInfo?.name || 'Guest'}
          </Text>
          {hijriDate && (
            <Text style={styles.date}>
              {hijriDate.hijri.day} {hijriDate.hijri.month.en}, {hijriDate.hijri.year} H
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={40} color="#00ACC1" />
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
              onPress={loadHomeData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Prayer Times Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Prayer Times</Text>
                <TouchableOpacity onPress={() => navigation.navigate('PrayerTimes')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {prayerTimes && (
                <View style={styles.prayerTimesContainer}>
                  <View style={styles.prayerTime}>
                    <Text style={styles.prayerName}>Fajr</Text>
                    <Text style={styles.prayerTimeText}>{prayerTimes.timings.fajr}</Text>
                  </View>
                  <View style={styles.prayerTime}>
                    <Text style={styles.prayerName}>Dhuhr</Text>
                    <Text style={styles.prayerTimeText}>{prayerTimes.timings.dhuhr}</Text>
                  </View>
                  <View style={styles.prayerTime}>
                    <Text style={styles.prayerName}>Asr</Text>
                    <Text style={styles.prayerTimeText}>{prayerTimes.timings.asr}</Text>
                  </View>
                  <View style={styles.prayerTime}>
                    <Text style={styles.prayerName}>Maghrib</Text>
                    <Text style={styles.prayerTimeText}>{prayerTimes.timings.maghrib}</Text>
                  </View>
                  <View style={styles.prayerTime}>
                    <Text style={styles.prayerName}>Isha</Text>
                    <Text style={styles.prayerTimeText}>{prayerTimes.timings.isha}</Text>
                  </View>
                </View>
              )}
            </View>
            
            {/* Navigation Tiles */}
            <View style={styles.tilesContainer}>
              <TouchableOpacity 
                style={styles.tile}
                onPress={() => navigation.navigate('Quran')}
              >
                <Ionicons name="book-outline" size={32} color="#00ACC1" />
                <Text style={styles.tileText}>Quran</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tile}
                onPress={() => navigation.navigate('Calendar')}
              >
                <Ionicons name="calendar-outline" size={32} color="#00ACC1" />
                <Text style={styles.tileText}>Calendar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tile}
                onPress={() => navigation.navigate('Audio')}
              >
                <Ionicons name="headset-outline" size={32} color="#00ACC1" />
                <Text style={styles.tileText}>Audio</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tile}
                onPress={() => navigation.navigate('Qibla')}
              >
                <Ionicons name="compass-outline" size={32} color="#00ACC1" />
                <Text style={styles.tileText}>Qibla</Text>
              </TouchableOpacity>
            </View>
            
            {/* Audio Content Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Featured Audio</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Audio')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {featuredAudio.length > 0 ? (
                <View style={styles.audioContainer}>
                  {featuredAudio.map((audio, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.audioItem}
                      onPress={() => navigation.navigate('AudioDetails', { audioId: audio.id })}
                    >
                      <Image 
                        source={{ uri: audio.thumbnail || 'https://via.placeholder.com/60' }} 
                        style={styles.audioThumbnail}
                      />
                      <View style={styles.audioInfo}>
                        <Text style={styles.audioTitle} numberOfLines={1}>
                          {audio.title}
                        </Text>
                        <Text style={styles.audioSpeaker} numberOfLines={1}>
                          {audio.speaker}
                        </Text>
                        <Text style={styles.audioDuration}>
                          {audio.duration}
                        </Text>
                      </View>
                      <Ionicons name="play-circle-outline" size={36} color="#00ACC1" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.noContentText}>No featured audio content available</Text>
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  date: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00ACC1',
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tile: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tileText: {
    marginTop: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  audioContainer: {
    marginTop: 8,
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  audioThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  audioSpeaker: {
    fontSize: 14,
    color: '#718096',
  },
  audioDuration: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
  },
  noContentText: {
    textAlign: 'center',
    color: '#718096',
    paddingVertical: 20,
  },
});

export default HomeScreen;