import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Main app wrapper with context providers
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts
  async function loadFonts() {
    try {
      await Font.loadAsync({
        // Standard fonts
        'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
        'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        // Arabic fonts
        'NotoNaskhArabic-Regular': require('./assets/fonts/NotoNaskhArabic-Regular.ttf'),
        'NotoNaskhArabic-Bold': require('./assets/fonts/NotoNaskhArabic-Bold.ttf'),
      });

      setFontsLoaded(true);
    } catch (error) {
      console.error('Error loading fonts:', error);
      // Proceed even if fonts fail to load
      setFontsLoaded(true);
    }
  }

  useEffect(() => {
    loadFonts();
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#00ACC1" />
        <Text style={{ marginTop: 16, color: '#2C3E50', fontSize: 16 }}>Loading Application...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AlertProvider>
          <AuthProvider>
            <MainNavigator />
          </AuthProvider>
        </AlertProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

// Main navigator that switches between auth and main app based on authentication
function MainNavigator() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#00ACC1" />
        <Text style={{ marginTop: 16, color: '#2C3E50', fontSize: 16 }}>Checking Authentication...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}