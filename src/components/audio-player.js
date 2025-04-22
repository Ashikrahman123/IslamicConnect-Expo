import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Slider,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// In a real implementation, we would import and use the Audio API from expo-av
// For this example, we'll create a mock implementation
const mockAudio = {
  Sound: {
    createAsync: async (source) => {
      // Mock loading the audio file
      return new Promise((resolve) => {
        setTimeout(() => {
          // Return a mock Sound object
          resolve({
            sound: {
              playAsync: () => Promise.resolve(),
              pauseAsync: () => Promise.resolve(),
              stopAsync: () => Promise.resolve(),
              unloadAsync: () => Promise.resolve(),
              getStatusAsync: () => Promise.resolve({
                isPlaying: true,
                positionMillis: 0,
                durationMillis: 300000, // 5 minutes
                isLoaded: true
              }),
              setPositionAsync: (position) => Promise.resolve(),
              setRateAsync: (rate, shouldCorrectPitch) => Promise.resolve(),
              setVolumeAsync: (volume) => Promise.resolve()
            },
            status: {
              isPlaying: false,
              positionMillis: 0,
              durationMillis: 300000, // 5 minutes
              isLoaded: true
            }
          });
        }, 1000); // Simulate loading delay
      });
    }
  }
};

const AudioPlayer = ({ 
  audioUrl, 
  title, 
  subtitle,
  albumArt,
  onFinish,
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const sound = useRef(null);
  const positionTimer = useRef(null);

  // Format seconds into MM:SS format
  const formatTime = (millis) => {
    if (!millis) return '00:00';
    
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Load the audio file
  const loadAudio = async () => {
    try {
      // Reset states
      setIsLoading(true);
      setError(null);
      
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      
      // In a real implementation, we would use the Audio API from expo-av
      // For this example, we're using a mock implementation
      const { sound: newSound, status } = await mockAudio.Sound.createAsync(
        { uri: audioUrl }
      );
      
      sound.current = newSound;
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsLoading(false);
      
      // Set up a timer to update the position every second when playing
      startPositionTimer();
      
      // Set up a listener for playback finishing
      // In a real implementation, we would use the sound.setOnPlaybackStatusUpdate
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Could not load audio file');
      setIsLoading(false);
    }
  };

  // Start timer to track position during playback
  const startPositionTimer = () => {
    stopPositionTimer(); // Clear any existing timer
    
    positionTimer.current = setInterval(async () => {
      if (sound.current && !isSeeking) {
        try {
          const status = await sound.current.getStatusAsync();
          setPosition(status.positionMillis);
          
          // Check if playback has finished
          if (status.positionMillis >= status.durationMillis) {
            setIsPlaying(false);
            setPosition(0);
            stopPositionTimer();
            
            if (onFinish) {
              onFinish();
            }
          }
        } catch (err) {
          console.error('Error getting playback status:', err);
        }
      }
    }, 1000);
  };

  // Stop position tracking timer
  const stopPositionTimer = () => {
    if (positionTimer.current) {
      clearInterval(positionTimer.current);
      positionTimer.current = null;
    }
  };

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!sound.current) return;
    
    try {
      if (isPlaying) {
        await sound.current.pauseAsync();
        stopPositionTimer();
      } else {
        await sound.current.playAsync();
        startPositionTimer();
      }
      
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Error toggling playback:', err);
    }
  };

  // Seek to position
  const seek = async (value) => {
    if (!sound.current) return;
    
    try {
      await sound.current.setPositionAsync(value);
      setPosition(value);
    } catch (err) {
      console.error('Error seeking:', err);
    }
  };

  // Change playback speed
  const changePlaybackSpeed = async () => {
    if (!sound.current) return;
    
    try {
      // Cycle through speeds: 1.0 -> 1.25 -> 1.5 -> 0.75 -> 1.0
      let newSpeed;
      
      switch (playbackSpeed) {
        case 1.0:
          newSpeed = 1.25;
          break;
        case 1.25:
          newSpeed = 1.5;
          break;
        case 1.5:
          newSpeed = 0.75;
          break;
        case 0.75:
        default:
          newSpeed = 1.0;
          break;
      }
      
      await sound.current.setRateAsync(newSpeed, true);
      setPlaybackSpeed(newSpeed);
    } catch (err) {
      console.error('Error changing playback speed:', err);
    }
  };

  // Load audio when component mounts or URL changes
  useEffect(() => {
    loadAudio();
    
    // Cleanup function
    return () => {
      stopPositionTimer();
      
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [audioUrl]);

  // Compact player for mini-player in the app
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={togglePlayback}
          disabled={isLoading || error}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#00ACC1" />
          ) : error ? (
            <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
          ) : isPlaying ? (
            <Ionicons name="pause" size={24} color="#2C3E50" />
          ) : (
            <Ionicons name="play" size={24} color="#2C3E50" />
          )}
        </TouchableOpacity>
        
        <View style={styles.compactInfo}>
          <Text 
            style={styles.compactTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title || 'Unknown Title'}
          </Text>
          <Text 
            style={styles.compactSubtitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle || 'Unknown Artist'}
          </Text>
        </View>
        
        <View style={styles.compactControls}>
          <Text style={styles.compactTimeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
          <TouchableOpacity onPress={() => {
            if (onFinish) onFinish();
          }}>
            <Ionicons name="close" size={22} color="#718096" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Full featured player
  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ACC1" />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadAudio}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.infoContainer}>
            <Text 
              style={styles.title}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title || 'Unknown Title'}
            </Text>
            <Text 
              style={styles.subtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle || 'Unknown Artist'}
            </Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                minimumTrackTintColor="#00ACC1"
                maximumTrackTintColor="#E2E8F0"
                thumbTintColor="#00ACC1"
                onSlidingStart={() => setIsSeeking(true)}
                onSlidingComplete={(value) => {
                  setIsSeeking(false);
                  seek(value);
                }}
              />
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => seek(Math.max(0, position - 10000))}
              >
                <Ionicons name="play-back" size={24} color="#718096" />
                <Text style={styles.buttonText}>10s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={togglePlayback}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={36} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => seek(Math.min(duration, position + 10000))}
              >
                <Ionicons name="play-forward" size={24} color="#718096" />
                <Text style={styles.buttonText}>10s</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.additionalControls}>
              <TouchableOpacity 
                style={styles.speedButton}
                onPress={changePlaybackSpeed}
              >
                <Text style={styles.speedButtonText}>
                  {playbackSpeed.toFixed(2)}x
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 10,
    color: '#718096',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 16,
    color: '#2C3E50',
    fontSize: 14,
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
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  compactInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  compactSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 12,
    color: '#718096',
    minWidth: 40,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#00ACC1',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  secondaryButton: {
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButton: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speedButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00ACC1',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTimeText: {
    fontSize: 12,
    color: '#718096',
    marginRight: 8,
  },
});

export default AudioPlayer;