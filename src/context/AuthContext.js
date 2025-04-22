import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants/api';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const userToken = await AsyncStorage.getItem('userToken');
        
        if (userString && userToken) {
          const user = JSON.parse(userString);
          setUser(user);
          
          // Set the authentication token for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/register`, userData);
      
      const { user, token } = response.data;
      
      // Store user data and token
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('userToken', token);
      
      // Set auth token for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Log in user
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/login`, credentials);
      
      const { user, token } = response.data;
      
      // Store user data and token
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('userToken', token);
      
      // Set auth token for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid credentials. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Log out user
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API
      await axios.post(`${API_URL}/api/logout`);
      
      // Clear storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken');
      
      // Clear auth header
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user even if API fails
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/api/user/profile`, profileData);
      
      const updatedUser = response.data;
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Value object to be provided to consumers
  const authContext = {
    user,
    isLoading,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};