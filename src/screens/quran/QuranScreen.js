import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSurahs, searchQuran } from '../../api/quran';

const QuranScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [surahs, setSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSurahs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const surahsData = await getSurahs();
      setSurahs(surahsData);
    } catch (err) {
      console.error('Error loading surahs:', err);
      setError('Could not load Quran data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSurahs();
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      setIsLoading(true);
      
      const results = await searchQuran(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching Quran:', err);
      setError('Could not search Quran');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const renderSurahItem = ({ item }) => (
    <TouchableOpacity
      style={styles.surahItem}
      onPress={() => navigation.navigate('SurahDetail', { surahNumber: item.number })}
    >
      <View style={styles.surahNumberContainer}>
        <Text style={styles.surahNumber}>{item.number}</Text>
      </View>
      
      <View style={styles.surahInfo}>
        <Text style={styles.surahName}>{item.englishName}</Text>
        <Text style={styles.surahMeaning}>
          {item.englishNameTranslation}{' • '}{item.revelationType}
        </Text>
        <Text style={styles.versesCount}>{item.numberOfAyahs} verses</Text>
      </View>
      
      <Text style={styles.arabicName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => navigation.navigate('SurahDetail', { 
        surahNumber: item.surah.number,
        verseNumber: item.numberInSurah
      })}
    >
      <View style={styles.searchResultHeader}>
        <Text style={styles.searchResultSurah}>
          {item.surah.englishName} ({item.surah.number}:{item.numberInSurah})
        </Text>
      </View>
      
      <Text style={styles.searchResultText}>{item.text}</Text>
      
      {item.translation && (
        <Text style={styles.searchResultTranslation}>{item.translation}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quran</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#718096" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search the Quran..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={clearSearch}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#718096" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ACC1" />
          <Text style={styles.loadingText}>
            {isSearching ? 'Searching...' : 'Loading Quran...'}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={isSearching ? handleSearch : loadSurahs}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isSearching ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResultItem}
          keyExtractor={(item, index) => `search-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#A0AEC0" />
              <Text style={styles.emptyText}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={surahs}
          renderItem={renderSurahItem}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            setRefreshing(true);
            loadSurahs();
          }}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#00ACC1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  listContent: {
    padding: 16,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  surahNumberContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F9FA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  surahNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ACC1',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  surahMeaning: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 4,
  },
  versesCount: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  arabicName: {
    fontSize: 20,
    color: '#43A047',
    fontFamily: 'NotoNaskhArabic-Regular',
    marginLeft: 8,
  },
  searchResultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchResultHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  searchResultSurah: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ACC1',
  },
  searchResultText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 8,
    fontFamily: 'NotoNaskhArabic-Regular',
    textAlign: 'right',
  },
  searchResultTranslation: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default QuranScreen;