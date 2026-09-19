/**
 * Browser Notification utilities for Eye Drop alerts
 */

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch (e) {
    console.error('Failed to request notification permission', e);
    return 'denied';
  }
};

export const sendDoseDueNotification = (medName: string) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  try {
    const title = `Eye Drops Due: ${medName}`;
    const options: NotificationOptions = {
      body: `It's time for Maa's next dose of ${medName}. Please ensure clean hands before administering.`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `dose-due-${medName}`,
      requireInteraction: true,
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  } catch (e) {
    console.error('Error sending dose notification', e);
  }
};
