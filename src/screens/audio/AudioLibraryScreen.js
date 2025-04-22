import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllAudioContent, getCategories } from '../../api/audioContent';

const AudioLibraryScreen = ({ navigation }) => {
  const [audioContent, setAudioContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAudioContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all audio content
      const content = await getAllAudioContent();
      setAudioContent(content);
      setFilteredContent(content);
      
      // Get categories
      const categoryList = await getCategories();
      setCategories(['All', ...categoryList]);
      
    } catch (err) {
      console.error('Error fetching audio content:', err);
      setError('Could not load audio content. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAudioContent();
  }, []);

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    
    if (category === 'All') {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setFilteredContent(audioContent);
      }
      return;
    }
    
    const filtered = audioContent.filter(item => item.category === category);
    
    if (searchQuery) {
      setFilteredContent(
        filtered.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.speaker.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredContent(filtered);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text) {
      const filtered = audioContent.filter(item => 
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.speaker.toLowerCase().includes(text.toLowerCase())
      );
      
      if (selectedCategory !== 'All') {
        setFilteredContent(filtered.filter(item => item.category === selectedCategory));
      } else {
        setFilteredContent(filtered);
      }
    } else {
      if (selectedCategory !== 'All') {
        filterByCategory(selectedCategory);
      } else {
        setFilteredContent(audioContent);
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAudioContent();
  };

  const navigateToAudioDetail = (audioId) => {
    navigation.navigate('AudioDetail', { audioId });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem
      ]}
      onPress={() => filterByCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderAudioItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.audioItem}
      onPress={() => navigateToAudioDetail(item.id)}
    >
      <Image 
        source={{ uri: item.thumbnail || 'https://via.placeholder.com/80' }}
        style={styles.audioThumbnail}
      />
      
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.audioSpeaker}>{item.speaker}</Text>
        <View style={styles.audioMeta}>
          <Text style={styles.audioDuration}>{item.duration}</Text>
          <Text style={styles.audioCategory}>{item.category}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play-circle" size={48} color="#00ACC1" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audio Library</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#A0AEC0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lectures, recitations..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSearch('')}
          >
            <Ionicons name="close-circle" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Categories horizontal list */}
      <View style={styles.categoriesContainer}>
        {isLoading && !refreshing ? (
          <ActivityIndicator size="small" color="#00ACC1" style={styles.categoryLoader} />
        ) : (
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        )}
      </View>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ACC1" />
          <Text style={styles.loadingText}>Loading audio content...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchAudioContent}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredContent}
          renderItem={renderAudioItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.audioList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="headset-outline" size={48} color="#A0AEC0" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No audio content found matching "${searchQuery}"`
                  : selectedCategory !== 'All'
                    ? `No audio content in ${selectedCategory} category`
                    : 'No audio content available'
                }
              </Text>
            </View>
          }
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#2C3E50',
  },
  clearButton: {
    padding: 8,
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryLoader: {
    marginHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  selectedCategoryItem: {
    backgroundColor: '#00ACC1',
  },
  categoryText: {
    color: '#64748B',
    fontWeight: '500',
  },
  selectedCategoryText: {
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
  audioList: {
    padding: 16,
    paddingBottom: 20,
  },
  audioItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  audioThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  audioInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    lineHeight: 22,
  },
  audioSpeaker: {
    fontSize: 14,
    color: '#00ACC1',
    marginBottom: 8,
  },
  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioDuration: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 12,
  },
  audioCategory: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default AudioLibraryScreen;