import admin from 'firebase-admin';
import serviceAccount from '../config/firebaseServiceAccount.json' assert { type: 'json' };

// Initiera Firebase Admin (görs bara en gång)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const sendPushNotification = async (pushTokens, title, body, data = {}) => {
  if (!pushTokens || pushTokens.length === 0) return;

  // Extrahera bara token-strängarna från användarens objekt
  const tokens = pushTokens.map(t => t.token);

  const message = {
    notification: {
      title: title,
      body: body
    },
    data: data, // Ex: { postId: "123" } för att kunna navigera vid klick
    tokens: tokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Successfully sent push notification:', response.successCount);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};