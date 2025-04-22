import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Text, Platform } from 'react-native';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import QuranScreen from '../screens/quran/QuranScreen';
import SurahDetailScreen from '../screens/quran/SurahDetailScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import AudioLibraryScreen from '../screens/audio/AudioLibraryScreen';
import AudioDetailScreen from '../screens/audio/AudioDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PrayerTimesScreen from '../screens/prayer/PrayerTimesScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const QuranStack = createStackNavigator();
const CalendarStack = createStackNavigator();
const AudioStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Home Stack
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="PrayerTimes" component={PrayerTimesScreen} />
    </HomeStack.Navigator>
  );
};

// Quran Stack
const QuranStackNavigator = () => {
  return (
    <QuranStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <QuranStack.Screen name="QuranMain" component={QuranScreen} />
      <QuranStack.Screen name="SurahDetail" component={SurahDetailScreen} />
    </QuranStack.Navigator>
  );
};

// Calendar Stack
const CalendarStackNavigator = () => {
  return (
    <CalendarStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} />
    </CalendarStack.Navigator>
  );
};

// Audio Stack
const AudioStackNavigator = () => {
  return (
    <AudioStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AudioStack.Screen name="AudioMain" component={AudioLibraryScreen} />
      <AudioStack.Screen name="AudioDetail" component={AudioDetailScreen} />
    </AudioStack.Navigator>
  );
};

// Profile Stack
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
};

// Tab navigator with custom styles
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Quran') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Audio') {
            iconName = focused ? 'headset' : 'headset-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00ACC1',
        tabBarInactiveTintColor: '#718096',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: Platform.OS === 'ios' ? 10 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: Platform.OS === 'ios' ? 0 : 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Quran" component={QuranStackNavigator} />
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} />
      <Tab.Screen name="Audio" component={AudioStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default AppNavigator;