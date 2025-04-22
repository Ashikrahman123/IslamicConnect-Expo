import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Import navigation and context providers
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';

// Main app with auth state
const MainApp = () => {
  const { user, isLoading } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'noto-sans': require('./src/assets/fonts/NotoSans-Regular.ttf'),
          'noto-sans-bold': require('./src/assets/fonts/NotoSans-Bold.ttf'),
          'noto-naskh-arabic': require('./src/assets/fonts/NotoNaskhArabic-Regular.ttf'),
          ...Ionicons.font,
          ...FontAwesome5.font,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Continue even if fonts fail to load
        setFontsLoaded(true);
      }
    }
    
    loadFonts();
  }, []);

  // Show loading while fonts and auth state are loading
  if (isLoading || !fontsLoaded) {
    return null; // Will be replaced with a splash screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Root component with providers
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AlertProvider>
          <MainApp />
        </AlertProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}