import { getApp, getApps, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

let connection: Promise<{ auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> }> | undefined;

// Invoked after hydration only. Never initializes Firebase during SSR.
export function connectFirebase() {
  if (!firebaseConfig) throw new Error("Firebase project is not configured.");
  const config = firebaseConfig;
  connection ??= (async () => {
    const app = getApps().length ? getApp() : initializeApp(config);
    const auth = getAuth(app);
    await setPersistence(auth, browserSessionPersistence);
    return { auth, db: getFirestore(app) };
  })().catch((error) => { connection = undefined; throw error; });
  return connection;
}