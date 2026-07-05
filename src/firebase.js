import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const fallbackConfig = {
  apiKey: 'AIzaSyDQ0OdyAUNOcm-buw9ky3OKenwEagr3f2c',
  authDomain: 'hktravel-ad3db.firebaseapp.com',
  projectId: 'hktravel-ad3db',
  storageBucket: 'hktravel-ad3db.firebasestorage.app',
  messagingSenderId: '470064282772',
  appId: '1:470064282772:web:d32ee6623fc37dd63cc881',
};

function parsePackedEnv(value) {
  if (!value || !String(value).includes('VITE_FIREBASE_')) return {};

  return String(value)
    .split(/\r?\n/)
    .reduce((config, line) => {
      const [key, ...rest] = line.split('=');
      const rawValue = rest.join('=').trim();
      if (!key || !rawValue) return config;

      const configKey = {
        VITE_FIREBASE_API_KEY: 'apiKey',
        VITE_FIREBASE_AUTH_DOMAIN: 'authDomain',
        VITE_FIREBASE_PROJECT_ID: 'projectId',
        VITE_FIREBASE_STORAGE_BUCKET: 'storageBucket',
        VITE_FIREBASE_MESSAGING_SENDER_ID: 'messagingSenderId',
        VITE_FIREBASE_APP_ID: 'appId',
      }[key.trim()];

      if (configKey) config[configKey] = rawValue;
      return config;
    }, {});
}

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const packedEnvConfig = parsePackedEnv(import.meta.env.VITE_FIREBASE_API_KEY);
export const firebaseConfig = Object.fromEntries(
  Object.entries(fallbackConfig).map(([key, fallbackValue]) => [
    key,
    packedEnvConfig[key] || envConfig[key] || fallbackValue,
  ])
);

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
