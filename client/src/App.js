import React from 'react';
import { Route, Switch } from 'wouter';
import { ToastProvider } from './hooks/use-toast';
import { useAuth } from './hooks/use-auth';
import { ProtectedRoute } from './lib/protected-route';

// Pages
import HomePage from './pages/home-page';
import AuthPage from './pages/auth-page';
import CalendarPage from './pages/calendar-page';
import AudioLibraryPage from './pages/audio-library-page';
import ProfilePage from './pages/profile-page';
import NotFound from './pages/not-found';

function App() {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/calendar" component={CalendarPage} />
        <ProtectedRoute path="/audio-library" component={AudioLibraryPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </ToastProvider>
  );
}

export default App;
