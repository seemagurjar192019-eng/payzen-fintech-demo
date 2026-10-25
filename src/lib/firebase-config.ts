export function readFirebaseConfig(env: Record<string, string | undefined>) {
  const apiKey = env['VITE_FIREBASE_API_KEY'];
  const authDomain = env['VITE_FIREBASE_AUTH_DOMAIN'];
  const projectId = env['VITE_FIREBASE_PROJECT_ID'];
  const appId = env['VITE_FIREBASE_APP_ID'];
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  const storageBucket = env['VITE_FIREBASE_STORAGE_BUCKET'];
  const messagingSenderId = env['VITE_FIREBASE_MESSAGING_SENDER_ID'];
  return { apiKey, authDomain, projectId, appId, ...(storageBucket ? { storageBucket } : {}), ...(messagingSenderId ? { messagingSenderId } : {}) };
}

export const firebaseConfig = readFirebaseConfig(import.meta.env);