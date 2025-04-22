import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAudioContentById } from '../../api/audioContent';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;

const AudioDetailScreen = ({ route, navigation }) => {
  const { audioId } = route.params;
  const [audioContent, setAudioContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const sliderPosition = useRef(new Animated.Value(0)).current;
  const playbackAnimation = useRef(null);

  useEffect(() => {
    fetchAudioContent();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startPlaybackAnimation();
    } else {
      stopPlaybackAnimation();
    }
    
    return () => {
      if (playbackAnimation.current) {
        playbackAnimation.current.stop();
      }
    };
  }, [isPlaying]);

  const fetchAudioContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const content = await getAudioContentById(audioId);
      setAudioContent(content);
      
      // Set mock duration in seconds for demo
      setDuration(parseTimeToSeconds(content.duration));
      
    } catch (err) {
      console.error('Error fetching audio content:', err);
      setError('Could not load audio content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseTimeToSeconds = (timeString) => {
    // Parse time string like "5:30" to seconds
    if (!timeString) return 0;
    
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseInt(parts[1]);
      return minutes * 60 + seconds;
    }
    
    return 0;
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const startPlaybackAnimation = () => {
    if (playbackAnimation.current) {
      playbackAnimation.current.stop();
    }
    
    const remainingTime = duration - currentPosition;
    
    playbackAnimation.current = Animated.timing(sliderPosition, {
      toValue: SLIDER_WIDTH,
      duration: remainingTime * 1000,
      useNativeDriver: false,
    });
    
    playbackAnimation.current.start(({ finished }) => {
      if (finished) {
        setIsPlaying(false);
        setCurrentPosition(0);
        sliderPosition.setValue(0);
      }
    });
  };

  const stopPlaybackAnimation = () => {
    if (playbackAnimation.current) {
      playbackAnimation.current.stop();
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause logic - in a real app, would pause actual audio
      setIsPlaying(false);
      
      // Update current position based on slider
      const position = (sliderPosition.__getValue() / SLIDER_WIDTH) * duration;
      setCurrentPosition(position);
    } else {
      // Play logic - in a real app, would play actual audio
      setIsPlaying(true);
    }
  };

  const handleSliderMove = (value) => {
    stopPlaybackAnimation();
    sliderPosition.setValue(value);
    
    const position = (value / SLIDER_WIDTH) * duration;
    setCurrentPosition(position);
    
    if (isPlaying) {
      startPlaybackAnimation();
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00ACC1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.placeholderButton} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ACC1" />
          <Text style={styles.loadingText}>Loading audio content...</Text>
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
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholderButton} />
        </View>
        
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
          <Ionicons name="arrow-back" size={24} color="#00ACC1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {audioContent?.title || 'Audio Content'}
        </Text>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF6B6B" : "#00ACC1"} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.audioInfo}>
          <Image 
            source={{ uri: audioContent?.thumbnail || 'https://via.placeholder.com/300' }}
            style={styles.thumbnail}
          />
          
          <Text style={styles.title}>{audioContent?.title}</Text>
          <Text style={styles.speaker}>{audioContent?.speaker}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{audioContent?.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{audioContent?.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{audioContent?.date}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.playerContainer}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <Animated.View 
                style={[
                  styles.sliderFill,
                  { width: sliderPosition }
                ]}
              />
            </View>
            
            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>{formatTime(currentPosition)}</Text>
              <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
            </View>
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-back" size={28} color="#00ACC1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.playPauseButton}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-forward" size={28} color="#00ACC1" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {audioContent?.description || 
            'This audio content provides valuable insights on Islamic teachings and practices. The speaker discusses key concepts with clarity and depth, making complex topics accessible to all listeners.'}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={24} color="#00ACC1" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color="#00ACC1" />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="list-outline" size={24} color="#00ACC1" />
            <Text style={styles.actionText}>Playlist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 8,
  },
  placeholderButton: {
    width: 40,
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
  scrollView: {
    flex: 1,
  },
  audioInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#E2E8F0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  speaker: {
    fontSize: 16,
    color: '#00ACC1',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  playerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginHorizontal: 20,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#00ACC1',
    borderRadius: 3,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 20,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    padding: 12,
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00ACC1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2C3E50',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#2C3E50',
    marginTop: 6,
  },
});

export default AudioDetailScreen;