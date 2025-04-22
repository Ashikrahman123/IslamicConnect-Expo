import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../../components/profile-settings';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'settings'

  const handleSaveSettings = (settings) => {
    // In a real app, we would update the user settings in the backend or context
    console.log('Saving settings:', settings);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'profile' ? 'My Profile' : 'Settings'}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name="person"
            size={20}
            color={activeTab === 'profile' ? '#00ACC1' : '#718096'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'profile' && styles.activeTabText
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings"
            size={20}
            color={activeTab === 'settings' ? '#00ACC1' : '#718096'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && styles.activeTabText
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' ? (
        <ScrollView style={styles.profileContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email provided'}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Activity</Text>
            
            <View style={styles.activityCard}>
              <Ionicons name="book-outline" size={24} color="#00ACC1" style={styles.activityIcon} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Quran Reading Plan</Text>
                <Text style={styles.activitySubtitle}>You've completed 12% of your plan</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '12%' }]} />
                </View>
              </View>
            </View>
            
            <View style={styles.activityCard}>
              <Ionicons name="headset-outline" size={24} color="#00ACC1" style={styles.activityIcon} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Lectures & Recitations</Text>
                <Text style={styles.activitySubtitle}>You've listened to 8 audio items</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Bookmarks & Favorites</Text>
            
            <TouchableOpacity 
              style={styles.bookmarkItem}
              onPress={() => navigation.navigate('Quran', { screen: 'SurahDetail', params: { surahNumber: 36 } })}
            >
              <Ionicons name="bookmark" size={20} color="#43A047" style={styles.bookmarkIcon} />
              <View style={styles.bookmarkInfo}>
                <Text style={styles.bookmarkTitle}>Surah Ya-Sin (36)</Text>
                <Text style={styles.bookmarkSubtitle}>Bookmarked on April 15, 2025</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#718096" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bookmarkItem}
              onPress={() => navigation.navigate('Audio', { screen: 'AudioDetail', params: { audioId: 1 } })}
            >
              <Ionicons name="heart" size={20} color="#FF6B6B" style={styles.bookmarkIcon} />
              <View style={styles.bookmarkInfo}>
                <Text style={styles.bookmarkTitle}>The Purpose of Life</Text>
                <Text style={styles.bookmarkSubtitle}>Favorited on April 10, 2025</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#718096" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ProfileSettings 
          navigation={navigation}
          onSave={handleSaveSettings}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00ACC1',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#718096',
  },
  activeTabText: {
    color: '#00ACC1',
    fontWeight: 'bold',
  },
  profileContent: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00ACC1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#43A047',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#718096',
  },
  infoSection: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  activityIcon: {
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ACC1',
    borderRadius: 3,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  bookmarkIcon: {
    marginRight: 16,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  bookmarkSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
});

export default ProfileScreen;