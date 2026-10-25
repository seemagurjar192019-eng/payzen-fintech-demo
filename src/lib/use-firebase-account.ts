import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

export type AccountProfile = { displayName: string; bio: string; currency: "INR" | "USD" | "EUR" };
export function useFirebaseAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(firebaseConfig));
  const [error, setError] = useState("");
  useEffect(() => {
    if (!firebaseConfig) return;
    let active = true;
    let stopAuth: (() => void) | undefined;
    let stopProfile: (() => void) | undefined;
    void (async () => {
      const [{ connectFirebase }, authApi, dbApi] = await Promise.all([import("./firebase"), import("firebase/auth"), import("firebase/firestore")]);
      const { auth, db } = await connectFirebase();
      if (!active) return;
      stopAuth = authApi.onAuthStateChanged(auth, (next) => {
        stopProfile?.();
        stopProfile = undefined;
        if (!active) return;
        setUser(next); setProfile(null); setLoading(false); setError("");
        if (next?.emailVerified) {
          stopProfile = dbApi.onSnapshot(dbApi.doc(db, "profiles", next.uid), (snapshot) => {
            if (!active) return;
            const data = snapshot.data();
            setProfile({ displayName: typeof data?.displayName === "string" ? data.displayName : next.displayName ?? "", bio: typeof data?.bio === "string" ? data.bio : "", currency: data?.currency === "USD" || data?.currency === "EUR" ? data.currency : "INR" });
          }, () => { if (active) setError("Profile could not load. Check Firestore access rules."); });
        }
      });
    })().catch(() => { if (active) { setError("Firebase connection failed. Check the project configuration."); setLoading(false); } });
    return () => { active = false; stopAuth?.(); stopProfile?.(); };
  }, []);

  async function saveProfile(data: AccountProfile) {
    if (!user?.emailVerified) throw new Error("Verify your email before saving your profile.");
    const [{ connectFirebase }, { doc, setDoc, serverTimestamp }, { updateProfile }] = await Promise.all([import("./firebase"), import("firebase/firestore"), import("firebase/auth")]);
    const { db } = await connectFirebase();
    const cleaned = { displayName: data.displayName.trim().slice(0, 60), bio: data.bio.trim().slice(0, 240), currency: data.currency };
    if (!cleaned.displayName) throw new Error("Enter your name.");
    await setDoc(doc(db, "profiles", user.uid), { ...cleaned, updatedAt: serverTimestamp() }, { merge: true });
    await updateProfile(user, { displayName: cleaned.displayName });
    setProfile(cleaned);
  }

  async function signOut() {
    const [{ connectFirebase }, authApi] = await Promise.all([import("./firebase"), import("firebase/auth")]);
    const { auth } = await connectFirebase();
    await authApi.signOut(auth);
    setUser(null); setProfile(null);
  }
  return { configured: Boolean(firebaseConfig), user, profile, loading, error, saveProfile, signOut };
}
export type FirebaseAccount = ReturnType<typeof useFirebaseAccount>;