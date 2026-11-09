import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fixa __dirname i ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Läs in serviceAccount-filen säkert via fs
const serviceAccountPath = path.join(__dirname, '../config/firebaseServiceAccount.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initiera Firebase Admin med modulära cert()-funktionen
initializeApp({
  credential: cert(serviceAccount)
});

export const sendPushNotification = async (pushTokens, title, body, data = {}) => {
  if (!pushTokens || pushTokens.length === 0) return;

  const tokens = pushTokens.map(t => t.token);

  const message = {
    notification: {
      title: title,
      body: body
    },
    data: data,
    tokens: tokens
  };

  try {
    const response = await getMessaging().sendEachForMulticast(message);
    console.log('Successfully sent push notification:', response.successCount);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};