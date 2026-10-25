import { LogIn, LogOut, Mail, Save, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FirebaseAccount } from "@/lib/use-firebase-account";
import { Press, Sheet } from "./ui";

function friendlyError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email or password is incorrect.";
  if (code.includes("email-already-in-use")) return "Unable to create this account. Try signing in or resetting your password.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please try again later.";
  if (code.includes("popup-blocked")) return "Your browser blocked Google sign-in. Allow popups and try again.";
  if (code.includes("popup-closed")) return "Google sign-in was closed.";
  if (code.includes("unauthorized-domain")) return "This website must be added to Firebase's authorized domains.";
  if (code.includes("operation-not-allowed")) return "This sign-in method has not been enabled in Firebase.";
  if (code.includes("weak-password")) return "Choose a stronger password.";
  return "Could not complete this action. Check your connection and Firebase settings.";
}

export function AccountPanel({ account, onClose }: { account: FirebaseAccount; onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(account.profile?.displayName ?? account.user?.displayName ?? "");
  const [bio, setBio] = useState(account.profile?.bio ?? "");
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR">(account.profile?.currency ?? "INR");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await action(); } catch (err) { setError(friendlyError(err)); } finally { setBusy(false); }
  }
  async function credentials() {
    const [{ connectFirebase }, api] = await Promise.all([import("@/lib/firebase"), import("firebase/auth")]);
    const { auth } = await connectFirebase();
    if (mode === "reset") {
      await api.sendPasswordResetEmail(auth, email.trim());
      setNotice("If an account exists, a password reset link has been sent. Follow the email to set your new password.");
    } else if (mode === "signup") {
      const result = await api.createUserWithEmailAndPassword(auth, email.trim(), password);
      try {
        await api.updateProfile(result.user, { displayName: name.trim() });
        await api.sendEmailVerification(result.user);
        setNotice("Account created. Verify your email, then sign in again to save your profile.");
      } catch {
        setNotice("Account created, but the verification email could not be sent. Use Resend verification below.");
      }
      setPassword("");
    } else {
      await api.signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    }
  }

  const inputClass = "h-11 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
  return (
    <Sheet onClose={onClose}>
      <div className="no-scrollbar max-h-[75dvh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck className="size-5 text-positive" />PayZen account</h2>
          <Press aria-label="Close account" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-secondary"><X className="size-4" /></Press>
        </div>
        {!account.configured ? (
          <div className="space-y-4">
            <p className="font-semibold">Firebase setup pending</p>
            <p className="text-sm leading-relaxed text-muted-foreground">An account cannot be created until your Firebase project is connected.</p>
            <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="block rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">Open Firebase Console</a>
            <p className="text-xs text-muted-foreground">Payments are simulated. No bank account is connected.</p>
          </div>
        ) : account.loading ? <p role="status">Connecting to Firebase…</p> : account.user ? (
          <div className="space-y-4">
            <p className="break-all text-sm text-muted-foreground">{account.user.email}</p>
            {!account.user.emailVerified ? <>
              <p className="text-sm">Verify your email before saving account details.</p>
              <Press disabled={busy} onClick={() => void run(async () => {
                const api = await import("firebase/auth");
                if (!account.user) return;
                await api.sendEmailVerification(account.user);
                setNotice("Verification email sent. After verification, sign out and sign in again.");
              })} className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3 text-sm font-semibold"><Mail className="size-4" />Resend verification</Press>
            </> : <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void run(async () => { await account.saveProfile({ displayName: name, bio, currency }); toast.success("Profile saved to Firebase"); setNotice("Profile saved."); }); }}>
              <label className="block space-y-1 text-xs font-semibold"><span>Name</span><input required value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputClass} autoComplete="name" /></label>
              <label className="block space-y-1 text-xs font-semibold"><span>Bio</span><textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={240} className="min-h-20 w-full resize-none rounded-lg border border-input bg-secondary p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
              <label className="block space-y-1 text-xs font-semibold"><span>Preferred currency</span><select value={currency} onChange={(e) => setCurrency(e.target.value === "USD" ? "USD" : e.target.value === "EUR" ? "EUR" : "INR")} className={inputClass}><option>INR</option><option>USD</option><option>EUR</option></select></label>
              <Press type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"><Save className="size-4" />{busy ? "Saving…" : "Save profile"}</Press>
            </form>}
            <Press disabled={busy} onClick={() => void run(async () => { await account.signOut(); setPassword(""); setName(""); setBio(""); setNotice("Signed out."); })} className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3 text-sm font-semibold"><LogOut className="size-4" />Sign out</Press>
          </div>
        ) : <>
          <div className="mb-4 flex gap-2" role="tablist" aria-label="Account access">
            {(["signin", "signup"] as const).map((item) => <Press key={item} role="tab" aria-selected={mode === item} disabled={busy} onClick={() => { setMode(item); setError(""); setNotice(""); }} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === item ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{item === "signin" ? "Sign in" : "Create account"}</Press>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); void run(credentials); }} className="space-y-4">
            {mode === "signup" && <label className="block space-y-1 text-xs font-semibold"><span>Name</span><input required value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" className={inputClass} /></label>}
            <label className="block space-y-1 text-xs font-semibold"><span>Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputClass} /></label>
            {mode !== "reset" && <label className="block space-y-1 text-xs font-semibold"><span>Password</span><input required type="password" minLength={mode === "signup" ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} className={inputClass} /></label>}
            <Press type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"><LogIn className="size-4" />{busy ? "Please wait…" : mode === "reset" ? "Send reset email" : mode === "signup" ? "Create account" : "Sign in"}</Press>
          </form>
          <Press disabled={busy} onClick={() => { setMode(mode === "reset" ? "signin" : "reset"); setError(""); setNotice(""); }} className="mt-3 w-full py-2 text-xs font-semibold">{mode === "reset" ? "Back to sign in" : "Forgot password?"}</Press>
          <Press disabled={busy} onClick={() => void run(async () => {
            const [{ connectFirebase }, api] = await Promise.all([import("@/lib/firebase"), import("firebase/auth")]);
            const { auth } = await connectFirebase();
            await api.signInWithPopup(auth, new api.GoogleAuthProvider());
          })} className="mt-2 w-full rounded-lg border border-input py-3 text-sm font-semibold">Continue with Google</Press>
        </>}
        {(error || account.error) && <p role="alert" className="mt-4 text-sm text-destructive">{error || account.error}</p>}
        {notice && <p role="status" className="mt-4 text-sm text-positive">{notice}</p>}
      </div>
    </Sheet>
  );
}