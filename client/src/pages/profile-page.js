import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/use-auth';
import Navbar from '../components/navbar';
import ProfileSettings from '../components/profile-settings';

const ProfilePage = () => {
  const { user, logoutMutation } = useAuth();
  
  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/settings');
      return response.json();
    },
    enabled: !!user,
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="card">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary islamic-pattern flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{user?.name || user?.username}</h2>
                <p className="text-gray-600 mb-4">{user?.email}</p>
                
                <div className="w-full mt-4">
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Account Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium">{user?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <span className="font-medium">{user?.preferredLanguage === 'en' ? 'English' : user?.preferredLanguage}</span>
                      </div>
                      {user?.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member Since:</span>
                          <span className="font-medium">{formatDate(user.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {settings && (
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">App Settings</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Theme:</span>
                          <span className="font-medium capitalize">{settings.theme}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Prayer Times Method:</span>
                          <span className="font-medium">{settings.calculationMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Notifications:</span>
                          <span className="font-medium">{settings.notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Auto-play Audio:</span>
                          <span className="font-medium">{settings.autoPlayAudio ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleLogout} 
                    className="btn-outline w-full mt-4 flex items-center justify-center"
                    disabled={logoutMutation.isLoading}
                  >
                    {logoutMutation.isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                        Logging out...
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings Form */}
          <div className="md:col-span-2">
            <ProfileSettings />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-primary text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Islamic Community App</p>
          <p className="text-sm mt-2">Designed and developed with ❤️ for the Muslim community</p>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
