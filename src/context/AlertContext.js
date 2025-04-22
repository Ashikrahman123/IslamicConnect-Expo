import React, { createContext, useState, useContext, useRef } from 'react';
import { Alert } from 'react-native';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const timeoutRef = useRef(null);

  const showAlert = (message, type = 'info', duration = 3000) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setAlert({ message, type });
    
    timeoutRef.current = setTimeout(() => {
      setAlert(null);
    }, duration);
  };

  const hideAlert = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAlert(null);
  };

  const showError = (message, duration = 3000) => {
    showAlert(message, 'error', duration);
  };

  const showSuccess = (message, duration = 3000) => {
    showAlert(message, 'success', duration);
  };

  const showInfo = (message, duration = 3000) => {
    showAlert(message, 'info', duration);
  };

  const showWarning = (message, duration = 3000) => {
    showAlert(message, 'warning', duration);
  };

  // For native alerts (blocking, with buttons)
  const showNativeAlert = (title, message, buttons = [{ text: 'OK' }]) => {
    Alert.alert(title, message, buttons);
  };

  const showConfirmation = (title, message, onConfirm, onCancel = () => {}) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: 'Confirm',
          onPress: onConfirm
        }
      ]
    );
  };

  return (
    <AlertContext.Provider
      value={{
        alert,
        showAlert,
        hideAlert,
        showError,
        showSuccess,
        showInfo,
        showWarning,
        showNativeAlert,
        showConfirmation
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};