import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Import other screens (to be created later)
// import QuranScreen from '../screens/quran/QuranScreen';
// import CalendarScreen from '../screens/calendar/CalendarScreen';
// import AudioLibraryScreen from '../screens/audio/AudioLibraryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    {/* Add other screens related to Home tab */}
  </Stack.Navigator>
);

// Quran Stack Navigator
const QuranStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    {/* To be replaced with actual QuranScreen when created */}
    <Stack.Screen name="QuranScreen" component={HomeScreen} />
    {/* Add other screens related to Quran tab */}
  </Stack.Navigator>
);

// Calendar Stack Navigator
const CalendarStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    {/* To be replaced with actual CalendarScreen when created */}
    <Stack.Screen name="CalendarScreen" component={HomeScreen} />
    {/* Add other screens related to Calendar tab */}
  </Stack.Navigator>
);

// Audio Stack Navigator
const AudioStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    {/* To be replaced with actual AudioLibraryScreen when created */}
    <Stack.Screen name="AudioLibraryScreen" component={HomeScreen} />
    {/* Add other screens related to Audio tab */}
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    {/* Add other screens related to Profile tab */}
  </Stack.Navigator>
);

// Main Tab Navigator
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00ACC1',
        tabBarInactiveTintColor: '#718096',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
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
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Quran" component={QuranStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Audio" component={AudioStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;