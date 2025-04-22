import React, { createContext, useState, useContext } from 'react';

// Create the alert context
export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });

  // Show an alert
  const showAlert = (type, message, duration = 3000) => {
    setAlert({ visible: true, type, message });
    
    // Auto-hide the alert after the specified duration
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  // Hide the alert manually
  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  // Success helper
  const showSuccess = (message, duration) => {
    showAlert('success', message, duration);
  };

  // Error helper
  const showError = (message, duration) => {
    showAlert('error', message, duration);
  };

  // Info helper
  const showInfo = (message, duration) => {
    showAlert('info', message, duration);
  };

  // Warning helper
  const showWarning = (message, duration) => {
    showAlert('warning', message, duration);
  };

  // Value object to be provided to consumers
  const alertContext = {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <AlertContext.Provider value={alertContext}>
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook to use the alert context
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};