import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const login = async (credentials) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/login`, credentials);
      
      if (response.data && response.data.token) {
        // Store user info and token
        const { token, ...userData } = response.data;
        setUserToken(token);
        setUserInfo(userData);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setIsLoading(false);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred';
      
      setLoginError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/register`, userData);
      
      if (response.data && response.data.token) {
        // Store user info and token
        const { token, ...newUserData } = response.data;
        setUserToken(token);
        setUserInfo(newUserData);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(newUserData));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setIsLoading(false);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred';
      
      setLoginError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Call logout API if needed
      // await axios.post(`${API_URL}/api/logout`);
      
      // Clear storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      
      // Clear states
      setUserToken(null);
      setUserInfo(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/api/user/profile`, updatedData);
      
      if (response.data) {
        setUserInfo({ ...userInfo, ...response.data });
        await AsyncStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...response.data }));
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile';
      
      return { success: false, error: errorMessage };
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      // Check if token exists
      let token = await AsyncStorage.getItem('userToken');
      let userInfoData = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfoData) {
        setUserToken(token);
        setUserInfo(JSON.parse(userInfoData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('isLoggedIn error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        loginError,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};