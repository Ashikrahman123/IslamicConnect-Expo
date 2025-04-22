import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Share,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSurah, getSurahArabic, getSurahAudio } from '../../api/quran';
import AudioPlayer from '../../components/audio-player';

const SurahDetailScreen = ({ route, navigation }) => {
  const { surahNumber, verseNumber } = route.params;
  const [surah, setSurah] = useState(null);
  const [arabicText, setArabicText] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState([]);
  const [settings, setSettings] = useState({
    showTranslation: true,
    fontSize: 'medium' // small, medium, large
  });
  
  // Reference to scroll to a specific verse if provided
  const flatListRef = useRef(null);
  
  const loadSurahData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch surah data with translation
      const surahData = await getSurah(surahNumber);
      setSurah(surahData);
      
      // Fetch Arabic text
      const arabicData = await getSurahArabic(surahNumber);
      setArabicText(arabicData);
      
      // Fetch audio recitation
      const audioData = await getSurahAudio(surahNumber);
      if (audioData && audioData.audioUrl) {
        setAudioUrl(audioData.audioUrl);
      }
    } catch (err) {
      console.error('Error loading surah data:', err);
      setError('Could not load surah data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSurahData();
  }, [surahNumber]);

  // Scroll to verse if verseNumber is provided
  useEffect(() => {
    if (verseNumber && surah && flatListRef.current) {
      // Need to wait for the list to render
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: verseNumber - 1,
          animated: true,
          viewPosition: 0
        });
      }, 500);
    }
  }, [verseNumber, surah]);

  const toggleBookmark = (verse) => {
    if (bookmarkedVerses.includes(verse)) {
      setBookmarkedVerses(bookmarkedVerses.filter(v => v !== verse));
    } else {
      setBookmarkedVerses([...bookmarkedVerses, verse]);
    }
    
    // In a real app, we would save bookmarks to AsyncStorage or backend
  };

  const handleShare = async (verse) => {
    try {
      await Share.share({
        message: `${verse.text}\n\n${verse.translation || ''}\n\nSurah ${surah.englishName} (${surahNumber}:${verse.number})`,
        title: `Surah ${surah.englishName} Verse ${verse.number}`
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const toggleAudioPlayback = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const toggleTranslation = () => {
    setSettings({
      ...settings,
      showTranslation: !settings.showTranslation
    });
  };

  const changeFontSize = () => {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setSettings({
      ...settings,
      fontSize: sizes[nextIndex]
    });
  };

  // Get font size based on settings
  const getArabicFontSize = () => {
    switch (settings.fontSize) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const getTranslationFontSize = () => {
    switch (settings.fontSize) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  // Create merged data with Arabic and translation
  const getMergedVerses = () => {
    if (!surah || !arabicText) return [];
    
    return surah.ayahs.map((ayah, index) => {
      const arabicVerse = arabicText.ayahs[index];
      return {
        number: ayah.numberInSurah,
        text: arabicVerse ? arabicVerse.text : ayah.text,
        translation: ayah.text,
        juz: ayah.juz,
        page: ayah.page
      };
    });
  };

  const renderVerseItem = ({ item }) => (
    <View style={[
      styles.verseContainer,
      verseNumber === item.number && styles.highlightedVerse
    ]}>
      <View style={styles.verseHeader}>
        <View style={styles.verseNumberContainer}>
          <Text style={styles.verseNumber}>{item.number}</Text>
        </View>
        
        <View style={styles.verseActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleBookmark(item.number)}
          >
            <Ionicons 
              name={bookmarkedVerses.includes(item.number) ? "bookmark" : "bookmark-outline"} 
              size={18} 
              color={bookmarkedVerses.includes(item.number) ? "#43A047" : "#718096"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-social-outline" size={18} color="#718096" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[
        styles.arabicText, 
        { fontSize: getArabicFontSize() }
      ]}>
        {item.text}
      </Text>
      
      {settings.showTranslation && (
        <Text style={[
          styles.translationText,
          { fontSize: getTranslationFontSize() }
        ]}>
          {item.translation}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ACC1" />
        <Text style={styles.loadingText}>Loading Surah...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadSurahData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        {surah && (
          <Text style={styles.headerTitle}>
            {surah.englishName} (سورة {surah.name})
          </Text>
        )}
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleTranslation}
          >
            <Ionicons 
              name={settings.showTranslation ? "language" : "language-outline"} 
              size={22} 
              color="#00ACC1" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={changeFontSize}
          >
            <Ionicons name="text" size={22} color="#00ACC1" />
          </TouchableOpacity>
        </View>
      </View>
      
      {surah && (
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>
            {surah.englishName} ({surah.number})
          </Text>
          <Text style={styles.surahDetails}>
            {surah.englishNameTranslation} • {surah.revelationType} • {surah.ayahs.length} Verses
          </Text>
        </View>
      )}
      
      {audioUrl && isPlayingAudio && (
        <View style={styles.audioPlayerContainer}>
          <AudioPlayer 
            audioUrl={audioUrl}
            title={surah?.englishName || 'Surah Recitation'}
            subtitle={`Recited by Al-Afasy`}
            compact={true}
            onFinish={() => setIsPlayingAudio(false)}
          />
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={getMergedVerses()}
        renderItem={renderVerseItem}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContent}
        onScrollToIndexFailed={(info) => {
          console.warn('Failed to scroll to verse:', info);
        }}
      />
      
      {audioUrl && !isPlayingAudio && (
        <TouchableOpacity 
          style={styles.floatingPlayButton}
          onPress={toggleAudioPlayback}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  surahInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  surahDetails: {
    fontSize: 14,
    color: '#718096',
  },
  listContent: {
    padding: 16,
  },
  verseContainer: {
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
  highlightedVerse: {
    borderWidth: 2,
    borderColor: '#00ACC1',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  verseNumberContainer: {
    backgroundColor: '#F0F9FA',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ACC1',
  },
  verseActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  arabicText: {
    fontSize: 24,
    color: '#2C3E50',
    lineHeight: 36,
    textAlign: 'right',
    fontFamily: 'NotoNaskhArabic-Regular',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
  },
  audioPlayerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  floatingPlayButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00ACC1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default SurahDetailScreen;