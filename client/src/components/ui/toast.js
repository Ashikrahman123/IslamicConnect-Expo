import React, { useEffect } from 'react';

// Toast component
export function Toast({ title, description, type = 'info', duration = 5000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Set background color based on type
  let bgColor = 'bg-primary';
  if (type === 'error') bgColor = 'bg-red-500';
  if (type === 'success') bgColor = 'bg-secondary';
  if (type === 'warning') bgColor = 'bg-accent';

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg mb-3 w-80 transform transition-all duration-300 ease-in-out`}>
      <div className="flex justify-between items-start">
        <div className="font-semibold">{title}</div>
        <button onClick={onClose} className="ml-4 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
    </div>
  );
}
