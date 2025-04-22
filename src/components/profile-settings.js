import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/use-auth';

const ProfileSettings = ({ navigation, onSave }) => {
  const { user, logoutMutation } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    cityName: 'San Francisco, CA'
  });
  
  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(15); // minutes before prayer
  const [darkMode, setDarkMode] = useState(false);
  const [useCalculationMethod, setUseCalculationMethod] = useState('MWL');
  const [language, setLanguage] = useState('english');
  
  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      
      // In a real app, we would load the user's settings from the backend or local storage
      // For this example, we'll just use default values
    }
  }, [user]);
  
  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, we would save the user's settings to the backend or local storage
      // For this example, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave({
          name,
          email,
          location,
          settings: {
            notificationsEnabled,
            reminderTime,
            darkMode,
            useCalculationMethod,
            language
          }
        });
      }
      
      Alert.alert('Success', 'Your settings have been saved.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logoutMutation.mutate();
          }
        }
      ]
    );
  };
  
  const calculationMethods = [
    { value: 'MWL', label: 'Muslim World League' },
    { value: 'ISNA', label: 'Islamic Society of North America' },
    { value: 'Makkah', label: 'Umm al-Qura University, Makkah' },
    { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
    { value: 'Egypt', label: 'Egyptian General Authority of Survey' }
  ];
  
  const languages = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'urdu', label: 'Urdu' },
    { value: 'french', label: 'French' },
    { value: 'turkish', label: 'Turkish' }
  ];

  return (
    <ScrollView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00ACC1" />
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Settings</Text>
        
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={() => {
            // In a real app, this would open a location picker
            Alert.alert('Location', 'This would open a location picker in a real app.');
          }}
        >
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationText}>{location.cityName}</Text>
            <Text style={styles.locationSubtext}>
              Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
            </Text>
          </View>
          <Ionicons name="location-outline" size={24} color="#00ACC1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prayer Time Settings</Text>
        
        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>Calculation Method</Text>
          <View style={styles.pickerContainer}>
            {calculationMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.pickerOption,
                  useCalculationMethod === method.value && styles.pickerOptionSelected
                ]}
                onPress={() => setUseCalculationMethod(method.value)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  useCalculationMethod === method.value && styles.pickerOptionTextSelected
                ]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>Prayer Time Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#E2E8F0", true: "#00ACC1" }}
            thumbColor={Platform.OS === 'android' ? "#FFFFFF" : ""}
          />
        </View>
        
        {notificationsEnabled && (
          <View style={styles.settingContainer}>
            <Text style={styles.settingLabel}>Reminder Time (minutes before)</Text>
            <View style={styles.reminderContainer}>
              <TouchableOpacity
                style={styles.reminderButton}
                onPress={() => setReminderTime(Math.max(0, reminderTime - 5))}
              >
                <Ionicons name="remove" size={20} color="#718096" />
              </TouchableOpacity>
              <Text style={styles.reminderValue}>{reminderTime}</Text>
              <TouchableOpacity
                style={styles.reminderButton}
                onPress={() => setReminderTime(reminderTime + 5)}
              >
                <Ionicons name="add" size={20} color="#718096" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#E2E8F0", true: "#00ACC1" }}
            thumbColor={Platform.OS === 'android' ? "#FFFFFF" : ""}
          />
        </View>
        
        <View style={styles.settingContainer}>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.pickerContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                style={[
                  styles.pickerOption,
                  language === lang.value && styles.pickerOptionSelected
                ]}
                onPress={() => setLanguage(lang.value)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  language === lang.value && styles.pickerOptionTextSelected
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  section: {
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F0F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  locationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    borderRadius: 8,
    padding: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  locationSubtext: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 8,
  },
  pickerOption: {
    backgroundColor: '#F0F9FA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#00ACC1',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderButton: {
    backgroundColor: '#F0F9FA',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginVertical: 24,
  },
  saveButton: {
    backgroundColor: '#00ACC1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileSettings;