"use client";

import { useState, useEffect } from 'react';

type ConnectionStatus = 'good' | 'medium' | 'slow' | 'offline';

interface ConnectionStatusProps {
  className?: string;
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>('good');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setStatus('good');
    const handleOffline = () => setStatus('offline');

    // Monitor API response times
    const handleResponseTime = (event: CustomEvent) => {
      const { responseTime } = event.detail;
      updateStatus(responseTime);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection-status-update', handleResponseTime as EventListener);

    // Set initial status
    if (!navigator.onLine) {
      setStatus('offline');
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-status-update', handleResponseTime as EventListener);
    };
  }, []);

  // Auto-hide good status after 3 seconds
  useEffect(() => {
    if (status === 'good' && isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    } else if (status !== 'good') {
      setIsVisible(true);
    }
  }, [status, isVisible]);

  // Function to be called by API interceptors
  const updateStatus = (responseTime: number) => {
    if (responseTime > 3000) {
      setStatus('slow');
      setIsVisible(true);
    } else if (responseTime > 1000) {
      setStatus('medium');
      setIsVisible(true);
    } else {
      setStatus('good');
      setIsVisible(true);
    }
  };

  if (!isVisible) return null;

  const statusConfig = {
    good: { icon: '✅', text: 'Connected', color: 'text-green-600 bg-green-50 border-green-200' },
    medium: { icon: '⚡', text: 'Loading...', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    slow: { icon: '🐌', text: 'Slow connection', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    offline: { icon: '❌', text: 'Offline', color: 'text-red-600 bg-red-50 border-red-200' }
  };

  const config = statusConfig[status];

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </div>
    </div>
  );
}

// Export the update function for use in API interceptors
export const connectionStatusUpdater = {
  update: (responseTime: number) => {
    // This will be handled by the component instance
    // For now, we'll use a custom event
    window.dispatchEvent(new CustomEvent('connection-status-update', {
      detail: { responseTime }
    }));
  }
};