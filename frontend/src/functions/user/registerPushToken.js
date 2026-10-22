import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import api from '../../api/axios';

export const registerPushToken = async () => {
  // Kontrollera om vi kör på en riktig enhet (Android/iOS) och inte i webbläsaren
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only supported on mobile devices via Capacitor.');
    return;
  }

  try {
    // 1. Kontrollera och begär behörighet för notiser
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied permission for push notifications.');
      return;
    }

    // 2. Registrera enheten hos FCM/APNS
    await PushNotifications.register();

    // 3. Lyssna på när token har genererats
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push token received:', token.value);

      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.log('No user logged in, saving token later.');
        return;
      }

      try {
        // Skicka token och plattform till din backend-route
        await api.post(
          '/users/save-push-token',
          { 
            token: token.value, 
            platform: Capacitor.getPlatform() // t.ex. 'android' eller 'ios'
          },
          { 
            headers: { Authorization: `Bearer ${authToken}` } 
          }
        );
        console.log('Push token successfully saved on the server!');
      } catch (error) {
        console.error('Failed to send push token to the server:', error);
      }
    });

    // Felhantering vid registrering
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error registering for push notifications:', error);
    });

    // Hantera inkommande notiser när appen är öppen (foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received in app:', notification);
    });

    // Hantera när användaren klickar på en notis från låsskärmen
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('User clicked the push notification:', notification);
    });

  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};