import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

// Create context
const ToastContext = createContext(null);

// Toast component
const Toast = ({ toast, onClose }) => {
  const { title, description, type = 'info', duration = 5000 } = toast;

  // Close toast after duration
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, onClose, duration]);

  // Set background color based on type
  let bgColor = 'bg-primary';
  if (type === 'error') bgColor = 'bg-red-500';
  if (type === 'success') bgColor = 'bg-secondary';
  if (type === 'warning') bgColor = 'bg-accent';

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg mb-3 w-80 transform transition-all duration-300 ease-in-out`}>
      <div className="flex justify-between items-start">
        <div className="font-semibold">{title}</div>
        <button onClick={() => onClose(toast.id)} className="ml-4 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
    </div>
  );
};

// Toast provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
  };

  // Remove a toast
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Create toast container in DOM
  const toastContainer = document.getElementById('toast-container');

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {toastContainer &&
        createPortal(
          <div className="fixed top-4 right-4 z-50">
            {toasts.map((toast) => (
              <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
          </div>,
          toastContainer
        )}
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
