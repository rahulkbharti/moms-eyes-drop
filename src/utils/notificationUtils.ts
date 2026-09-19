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

/**
 * Play an audible chime tone using Web Audio API
 */
export const playReminderSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Helper to schedule a tone
    const scheduleTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // 3-tone pleasant hospital chime: E5 (659Hz) -> G5 (784Hz) -> B5 (988Hz)
    scheduleTone(659.25, 0, 0.3);
    scheduleTone(783.99, 0.22, 0.35);
    scheduleTone(987.77, 0.48, 0.6);

    // Also vibrate if supported (e.g. on mobile devices)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch (e) {
    console.warn('Audio reminder playback failed:', e);
  }
};

export const sendDoseDueNotification = async (medName: string) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  try {
    const title = `🔔 Eye Drops Due: ${medName}`;
    const options: NotificationOptions = {
      body: `It's time for Maa's next dose of ${medName}. Please ensure clean hands before administering.`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `dose-due-${medName}-${Date.now()}`,
      requireInteraction: true,
      silent: false,
    };

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options);
          return;
        }
      } catch (swErr) {
        console.warn('Service worker notification failed, falling back to Notification API', swErr);
      }
    }

    new Notification(title, options);
  } catch (e) {
    console.error('Error sending dose notification', e);
  }
};

export const sendTestNotification = async () => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = '🔔 Eye Drops Reminder Test';
    const options: NotificationOptions = {
      body: 'Notifications & sound chime are working! You will be alerted when Maa\'s doses are due.',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `test-reminder-${Date.now()}`,
    };

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options);
          return true;
        }
      } catch {
        // fallback
      }
    }

    new Notification(title, options);
    return true;
  } catch (e) {
    console.error('Error sending test notification', e);
    return false;
  }
};
