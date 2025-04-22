import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getAllAudioContent,
  getAudioContentByCategory,
  getCategories,
  searchAudioContent
} from '../../api/audioContent';

const AudioLibraryScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [audioContent, setAudioContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAudioContent = async (category = 'all', query = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      let content = [];
      
      if (query.trim().length > 0) {
        // Search content
        content = await searchAudioContent(query);
      } else if (category === 'all') {
        // Get all content
        content = await getAllAudioContent();
      } else {
        // Get content by category
        content = await getAudioContentByCategory(category);
      }
      
      setAudioContent(content);
      
      // Load categories if not already loaded
      if (categories.length === 0) {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error loading audio content:', err);
      setError('Could not load audio content');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadAudioContent();
  }, []);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search query when changing category
    loadAudioContent(category);
  };

  // Handle search
  const handleSearch = () => {
    loadAudioContent(selectedCategory, searchQuery);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    loadAudioContent(selectedCategory);
  };

  // Render each audio item
  const renderAudioItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.audioItem}
      onPress={() => navigation.navigate('AudioDetail', { audioId: item.id })}
    >
      <Image 
        source={{ uri: item.thumbnail || 'https://via.placeholder.com/80' }} 
        style={styles.audioThumbnail}
      />
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.audioSpeaker}>
          {item.speaker}
        </Text>
        <View style={styles.audioMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#718096" />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#718096" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audio Library</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#718096" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lectures, recitations..."
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
      </View>
      
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.selectedCategoryButton
            ]}
            onPress={() => handleCategoryChange('all')}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.selectedCategoryButtonText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryButtonText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {isLoading ? (
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
            onPress={() => loadAudioContent(selectedCategory, searchQuery)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={audioContent}
          renderItem={renderAudioItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.audioListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="headset-outline" size={48} color="#A0AEC0" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 
                  ? `No results found for "${searchQuery}"`
                  : 'No audio content available'
                }
              </Text>
            </View>
          }
          onRefresh={() => {
            setRefreshing(true);
            loadAudioContent(selectedCategory, searchQuery);
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F9FA',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: '#00ACC1',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  audioListContent: {
    padding: 16,
  },
  audioItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  audioThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
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
    marginBottom: 8,
  },
  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#00ACC1',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AudioLibraryScreen;