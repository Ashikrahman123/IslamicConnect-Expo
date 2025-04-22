import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const ProfileScreen = ({ navigation }) => {
  const { userInfo, logout, updateUserProfile } = useAuth();
  const { showConfirmation, showSuccess } = useAlert();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [languagePreference, setLanguagePreference] = useState('english');
  
  const handleLogout = () => {
    showConfirmation(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        await logout();
      }
    );
  };
  
  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
  };
  
  const toggleDarkMode = () => {
    setDarkModeEnabled(previousState => !previousState);
  };
  
  const changeLanguage = (language) => {
    setLanguagePreference(language);
    showSuccess(`Language changed to ${language}`);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#00ACC1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: userInfo?.profilePicture || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userInfo?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{userInfo?.email || 'user@example.com'}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PersonalInformation')}
          >
            <Ionicons name="person-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={22} color="#A0AEC0" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Ionicons name="lock-closed-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={22} color="#A0AEC0" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>Prayer Notifications</Text>
            <Switch
              trackColor={{ false: "#E2E8F0", true: "#9CDBDF" }}
              thumbColor={notificationsEnabled ? "#00ACC1" : "#A0AEC0"}
              ios_backgroundColor="#E2E8F0"
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={styles.menuItem}>
            <Ionicons name="moon-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>Dark Mode</Text>
            <Switch
              trackColor={{ false: "#E2E8F0", true: "#9CDBDF" }}
              thumbColor={darkModeEnabled ? "#00ACC1" : "#A0AEC0"}
              ios_backgroundColor="#E2E8F0"
              onValueChange={toggleDarkMode}
              value={darkModeEnabled}
            />
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="language-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>Language</Text>
            <View style={styles.languageSelector}>
              <Text style={styles.selectedLanguage}>{languagePreference.charAt(0).toUpperCase() + languagePreference.slice(1)}</Text>
              <Ionicons name="chevron-forward" size={22} color="#A0AEC0" />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={22} color="#A0AEC0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>About App</Text>
            <Ionicons name="chevron-forward" size={22} color="#A0AEC0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#00ACC1" style={styles.menuIcon} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={22} color="#A0AEC0" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF6B6B" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#00ACC1',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguage: {
    fontSize: 16,
    color: '#718096',
    marginRight: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
});

export default ProfileScreen;