import React, { createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from './use-toast';

// Auth context
const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  const { toast } = useToast();

  // Query to fetch current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      return res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.name || userData.username}!`,
        type: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        type: 'error',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await apiRequest('POST', '/api/register', userData);
      return res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userData.name || userData.username}!`,
        type: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        type: 'error',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        type: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        type: 'error',
      });
    },
  });

  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const res = await apiRequest('PUT', '/api/user/settings', settings);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your settings have been updated successfully.',
        type: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Settings update failed',
        description: error.message,
        type: 'error',
      });
    },
  });

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
        updateSettingsMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
