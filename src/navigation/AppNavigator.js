import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import QuranScreen from '../screens/QuranScreen';
import AudioLibraryScreen from '../screens/AudioLibraryScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';
import IslamicCalendarScreen from '../screens/IslamicCalendarScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const QuranStack = createStackNavigator();
const AudioStack = createStackNavigator();
const CalendarStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Home stack
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'Home', headerShown: false }}
      />
      <HomeStack.Screen 
        name="PrayerTimes" 
        component={PrayerTimesScreen} 
        options={{ title: 'Prayer Times' }}
      />
    </HomeStack.Navigator>
  );
};

// Quran stack
const QuranStackNavigator = () => {
  return (
    <QuranStack.Navigator>
      <QuranStack.Screen 
        name="QuranMain" 
        component={QuranScreen} 
        options={{ title: 'Quran', headerShown: false }}
      />
      <QuranStack.Screen 
        name="SurahDetail" 
        component={SurahDetailScreen} 
        options={({ route }) => ({ title: route.params?.name || 'Surah' })}
      />
    </QuranStack.Navigator>
  );
};

// Audio stack
const AudioStackNavigator = () => {
  return (
    <AudioStack.Navigator>
      <AudioStack.Screen 
        name="AudioLibraryMain" 
        component={AudioLibraryScreen} 
        options={{ title: 'Audio Library', headerShown: false }}
      />
      <AudioStack.Screen 
        name="AudioPlayer" 
        component={AudioPlayerScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Now Playing' })}
      />
    </AudioStack.Navigator>
  );
};

// Calendar stack
const CalendarStackNavigator = () => {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen 
        name="CalendarMain" 
        component={IslamicCalendarScreen} 
        options={{ title: 'Islamic Calendar', headerShown: false }}
      />
      <CalendarStack.Screen 
        name="EventDetail" 
        component={EventDetailScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Event' })}
      />
    </CalendarStack.Navigator>
  );
};

// Profile stack
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profile', headerShown: false }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main tab navigator
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = Ionicons;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Quran') {
            IconComponent = FontAwesome5;
            iconName = 'quran';
          } else if (route.name === 'Audio') {
            iconName = focused ? 'headset' : 'headset-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00ACC1', // primary color
        tabBarInactiveTintColor: '#2C3E50', // text color
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Quran" component={QuranStackNavigator} />
      <Tab.Screen name="Audio" component={AudioStackNavigator} />
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default AppNavigator;