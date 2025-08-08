// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Notification type definition
type Notification = {
  id: number;
  type: 'success' | 'error' | 'info';  // Restricted types
  message: string;
  finish: boolean;
};

type NotificationContextType = {
  notify: (type: Notification['type'], message: string) => void;  // Function signature
};

// Create the Notification Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification Provider that will wrap the entire app
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // The notify function, which is used to add a notification
  const notify = (type: Notification['type'], message: string) => {
    const id = Date.now(); // Unique ID for each notification
    const finish = false;
    setNotifications((prev) => {
      const newNotifications = [...prev, { id, type, message, finish }];
      // Ensure only 3 notifications are kept
      if (newNotifications.length > 3) {
        newNotifications.shift(); // Remove the oldest one
      }
      return newNotifications;
    });

    // Auto-remove the notification after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => {
        return prev.map((notification) =>
          notification.id === id
            ? { ...notification, finish: true}
            : notification
        );
      });
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 700);
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Notification popups container */}
      <div className="fixed bottom-2 right-2 space-y-3 z-50">
        {notifications.map((n) => {
          let notificationClass = '';
          const animationClass = n.finish ? "animate-fadeOut" : "animate-fadeIn";

          if (n.type === 'success') {
            notificationClass = 'bg-green-500 text-white';
          } else if (n.type === 'error') {
            notificationClass = 'bg-red text-white';
          } else if (n.type === 'info') {
            notificationClass = 'bg-yellow-500 text-white';
          }

          return (
            <div key={n.id} className={`${notificationClass} flex p-3 rounded-lg shadow-lg items-center justify-center ${animationClass}`}>
              <div className='w-5 h-5 flex items-center justify-center'>
                {renderIcon(n.type)}
              </div>
              <div className='flex px-2 items-center justify-center'>
                {n.message}
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const InfoIcon = () => (
  <svg fill='white' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 1.5c-4.69 0-8.497 3.807-8.497 8.497s3.807 8.498 8.497 8.498 8.498-3.808 8.498-8.498-3.808-8.497-8.498-8.497zm0 6.5c-.414 0-.75.336-.75.75v5.5c0 .414.336.75.75.75s.75-.336.75-.75v-5.5c0-.414-.336-.75-.75-.75zm-.002-3c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z" fillRule="nonzero"/>
  </svg>
);

const renderIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};