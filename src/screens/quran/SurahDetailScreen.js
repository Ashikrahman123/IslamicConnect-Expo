import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSurah, getSurahArabic, getSurahAudio } from '../../api/quran';

const { width } = Dimensions.get('window');

const SurahDetailScreen = ({ route, navigation }) => {
  const { surahNumber } = route.params;
  const [surah, setSurah] = useState(null);
  const [surahArabic, setSurahArabic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [80, 50],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });
  
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchSurahData();
  }, []);

  const fetchSurahData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch surah in English translation
      const surahData = await getSurah(surahNumber);
      setSurah(surahData);
      
      // Fetch surah in Arabic
      const arabicData = await getSurahArabic(surahNumber);
      setSurahArabic(arabicData);
      
    } catch (err) {
      console.error('Error fetching surah:', err);
      setError('Could not load surah. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    try {
      if (isPlaying) {
        // Logic for stopping audio would go here
        // For now, just toggle the state
        setIsPlaying(false);
        return;
      }
      
      setIsAudioLoading(true);
      
      // Fetch audio URL
      const audioData = await getSurahAudio(surahNumber);
      setAudioURL(audioData.audioUrl);
      
      // Audio playing would be implemented here
      // For now, just toggle the state
      setIsPlaying(true);
      
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Could not play audio. Please try again.');
    } finally {
      setIsAudioLoading(false);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 30) {
      setFontSize(fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 2);
    }
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const renderVerse = ({ item }) => (
    <View style={styles.verseContainer}>
      <View style={styles.verseHeader}>
        <View style={styles.verseNumberContainer}>
          <Text style={styles.verseNumber}>{item.numberInSurah}</Text>
        </View>
        <TouchableOpacity style={styles.verseAction}>
          <Ionicons name="bookmark-outline" size={20} color="#718096" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.verseAction}>
          <Ionicons name="share-social-outline" size={20} color="#718096" />
        </TouchableOpacity>
      </View>
      
      {/* Arabic text */}
      {surahArabic && (
        <Text style={[styles.arabicText, { fontSize: fontSize + 8 }]}>
          {surahArabic.ayahs.find(a => a.numberInSurah === item.numberInSurah)?.text}
        </Text>
      )}
      
      {/* English translation */}
      {showTranslation && (
        <Text style={[styles.translationText, { fontSize: fontSize }]}>
          {item.text}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ACC1" />
          <Text style={styles.loadingText}>Loading surah...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00ACC1" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Error</Text>
          <View style={styles.placeholderButton} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchSurahData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#00ACC1" />
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.headerTitleContainer, 
            { opacity: titleOpacity }
          ]}
        >
          <Text style={styles.headerTitleText}>
            {surah?.englishName}
          </Text>
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.audioButton}
          onPress={handlePlayAudio}
          disabled={isAudioLoading}
        >
          {isAudioLoading ? (
            <ActivityIndicator size="small" color="#00ACC1" />
          ) : (
            <Ionicons 
              name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} 
              size={24} 
              color="#00ACC1" 
            />
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {/* Surah Info Header */}
      <Animated.View 
        style={[
          styles.surahInfoContainer,
          { opacity: headerOpacity }
        ]}
      >
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{surah?.englishName}</Text>
          <Text style={styles.surahTranslation}>{surah?.englishNameTranslation}</Text>
          <View style={styles.surahMetaInfo}>
            <Text style={styles.surahMeta}>
              {surah?.revelationType} • {surah?.numberOfAyahs} Verses
            </Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Reading Options */}
      <View style={styles.readingOptions}>
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={toggleTranslation}
        >
          <Ionicons 
            name={showTranslation ? "language" : "language-outline"} 
            size={22} 
            color={showTranslation ? "#00ACC1" : "#718096"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={decreaseFontSize}
        >
          <Ionicons name="remove-circle-outline" size={22} color="#718096" />
        </TouchableOpacity>
        
        <Text style={styles.fontSizeText}>
          {fontSize}
        </Text>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={increaseFontSize}
        >
          <Ionicons name="add-circle-outline" size={22} color="#718096" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="bookmark-outline" size={22} color="#718096" />
        </TouchableOpacity>
      </View>
      
      {/* Surah Content */}
      <Animated.FlatList
        data={surah?.ayahs}
        renderItem={renderVerse}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.surahContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
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
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    color: '#2C3E50',
    fontSize: 16,
    textAlign: 'center',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  audioButton: {
    padding: 8,
  },
  placeholderButton: {
    width: 40,
  },
  surahInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  surahInfo: {
    alignItems: 'center',
  },
  surahName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  surahTranslation: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 8,
  },
  surahMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahMeta: {
    fontSize: 14,
    color: '#00ACC1',
  },
  readingOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  optionButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  fontSizeText: {
    fontSize: 14,
    color: '#2C3E50',
    paddingHorizontal: 8,
  },
  surahContent: {
    padding: 16,
    paddingBottom: 40,
  },
  verseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00ACC1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 'auto',
  },
  verseNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  verseAction: {
    padding: 6,
    marginLeft: 8,
  },
  arabicText: {
    fontSize: 24,
    color: '#2C3E50',
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif',
    marginBottom: 16,
  },
  translationText: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
  },
});

export default SurahDetailScreen;