import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  message: string;
  type: NotificationType;
  show: boolean;
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification>({
    message: '',
    type: 'info',
    show: false,
  });

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  return { notification, showNotification };
}
