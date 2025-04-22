import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAudioContentById } from '../../api/audioContent';
import AudioPlayer from '../../components/audio-player';

const AudioDetailScreen = ({ route, navigation }) => {
  const { audioId } = route.params;
  const [audioContent, setAudioContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const loadAudioContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const content = await getAudioContentById(audioId);
      setAudioContent(content);
    } catch (err) {
      console.error('Error loading audio content:', err);
      setError('Could not load audio content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudioContent();
  }, [audioId]);

  const toggleFavorite = () => {
    // In a real app, this would update the user's favorites in the backend
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    // In a real app, this would open the native share dialog
    alert('Sharing functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ACC1" />
        <Text style={styles.loadingText}>Loading audio content...</Text>
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
          onPress={loadAudioContent}
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
        <Text style={styles.headerTitle} numberOfLines={1}>Audio Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF6B6B" : "#2C3E50"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {audioContent && (
          <>
            <View style={styles.audioInfoContainer}>
              <Image 
                source={{ uri: audioContent.thumbnail || 'https://via.placeholder.com/300' }} 
                style={styles.thumbnail}
              />
              
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{audioContent.title}</Text>
                <Text style={styles.speaker}>{audioContent.speaker}</Text>
                <View style={styles.metaContainer}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#718096" />
                    <Text style={styles.metaText}>{audioContent.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#718096" />
                    <Text style={styles.metaText}>{audioContent.date || 'Unknown'}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.playerContainer}>
              <AudioPlayer 
                audioUrl={audioContent.audioUrl} 
                title={audioContent.title}
                subtitle={audioContent.speaker}
                albumArt={audioContent.thumbnail}
                onFinish={() => console.log('Audio playback finished')}
              />
            </View>
            
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {audioContent.description || 'No description available.'}
              </Text>
            </View>
            
            {audioContent.category && (
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.categoryContainer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{audioContent.category}</Text>
                  </View>
                </View>
              </View>
            )}
            
            {audioContent.tags && audioContent.tags.length > 0 && (
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {audioContent.tags.map((tag, index) => (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {audioContent.relatedContent && audioContent.relatedContent.length > 0 && (
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Related Content</Text>
                {audioContent.relatedContent.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.relatedItem}
                    onPress={() => navigation.push('AudioDetail', { audioId: item.id })}
                  >
                    <Image 
                      source={{ uri: item.thumbnail || 'https://via.placeholder.com/60' }} 
                      style={styles.relatedThumbnail}
                    />
                    <View style={styles.relatedInfo}>
                      <Text style={styles.relatedTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.relatedSpeaker}>{item.speaker}</Text>
                      <Text style={styles.relatedDuration}>{item.duration}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#718096" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
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
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  audioInfoContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  speaker: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 4,
  },
  playerContainer: {
    padding: 16,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2C3E50',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#00ACC1',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#718096',
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  relatedThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  relatedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  relatedSpeaker: {
    fontSize: 12,
    color: '#718096',
  },
  relatedDuration: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
  },
});

export default AudioDetailScreen;