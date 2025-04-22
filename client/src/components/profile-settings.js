import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';

const ProfileSettings = () => {
  const { user, updateSettingsMutation } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [calculationMethod, setCalculationMethod] = useState('MWL');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  
  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/settings');
      return response.json();
    },
    enabled: !!user,
  });
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPreferredLanguage(user.preferredLanguage || 'en');
    }
  }, [user]);
  
  // Initialize form with settings data
  useEffect(() => {
    if (settings) {
      setTheme(settings.theme || 'light');
      setCalculationMethod(settings.calculationMethod || 'MWL');
      setNotificationsEnabled(settings.notificationsEnabled !== false);
      setAutoPlayAudio(settings.autoPlayAudio === true);
    }
  }, [settings]);
  
  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await apiRequest('PUT', '/api/user', userData);
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        type: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        type: 'error',
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update user profile
    updateProfileMutation.mutate({
      name,
      email,
      preferredLanguage,
    });
    
    // Update user settings
    updateSettingsMutation.mutate({
      theme,
      calculationMethod,
      notificationsEnabled,
      autoPlayAudio,
    });
  };
  
  // Show loading state
  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }
  
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6 text-primary">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="language" className="form-label">Preferred Language</label>
              <select
                id="language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="form-input"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="ur">Urdu</option>
                <option value="fr">French</option>
                <option value="id">Indonesian</option>
                <option value="tr">Turkish</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* App Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">App Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="theme" className="form-label">Theme</label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="form-input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label htmlFor="calculationMethod" className="form-label">Prayer Times Calculation Method</label>
              <select
                id="calculationMethod"
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value)}
                className="form-input"
              >
                <option value="MWL">Muslim World League</option>
                <option value="ISNA">Islamic Society of North America</option>
                <option value="Egypt">Egyptian General Authority of Survey</option>
                <option value="Makkah">Umm al-Qura University, Makkah</option>
                <option value="Karachi">University of Islamic Sciences, Karachi</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <input
                id="notifications"
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                Enable Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="autoPlayAudio"
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => setAutoPlayAudio(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="autoPlayAudio" className="ml-2 block text-sm text-gray-700">
                Auto-play Audio Content
              </label>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="btn-primary w-full md:w-auto"
            disabled={updateProfileMutation.isLoading || updateSettingsMutation.isLoading}
          >
            {(updateProfileMutation.isLoading || updateSettingsMutation.isLoading) ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
