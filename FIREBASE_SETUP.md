# Connect PayZen to your Firebase project

Firebase is not connected yet. The application keeps an explicitly separate local payment sandbox until a project is configured. No hosted user accounts or profiles exist yet.

1. Open https://console.firebase.google.com/ and create your project.
2. In Project settings → General, register a Web app and copy its `firebaseConfig` (public web configuration, not a service account private key).
3. Provide these public web values for the app environment:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
```

The first four values are required. Never share a service-account JSON or private key in chat.

4. Under Authentication → Sign-in method, enable Email/Password and Google (Google needs the support email).
5. Under Authentication → Settings → Authorized domains, add your published app domain and your preview domain. Add `localhost` only if you want local testing; new Firebase projects may not include it automatically.
6. Create Cloud Firestore in production mode and select the appropriate region. Paste the project-root `firestore.rules` into Firestore → Rules, then Publish. Do not use test mode or blanket public access.
7. Configure the verification and password-reset email templates under Authentication → Templates. Recovery uses Firebase's hosted email action page; reset codes are not handled in PayZen.
8. After configuration, test signup, verification link, sign-in, Google, profile save/read after refresh, reset email, sign-out and cross-account access isolation against the actual Firebase project. Those hosted checks have not been performed yet.

## What this foundation covers

- Firebase email/password signup and sign-in, Google sign-in, sign-out, verification email and Firebase-hosted password recovery.
- Verified account-owned Firestore profile (name, bio and preferred currency).
- Session persistence limited to the current browser tab session; Firebase manages its session. Browser persistence is not equivalent to a hardened server-cookie session.
- Private profile access rules. These rules are source files only until published in Firebase Console.

## Still blocked / not implemented

- The 200-feature production roadmap is not complete; see `roadmap.md`.
- Account-owned wallet storage, an authoritative atomic ledger, API authorization, App Check enforcement and fraud/rate-limit controls are not implemented.
- Payment sandbox data remains local and shared within this browser, not per-user Firebase wallet data. It is never uploaded to profiles or presented as a real balance.
- Phone OTP requires Firebase SMS setup, quotas, abuse controls and possibly billing. MFA, biometric/device locks, bank/card/UPI/BBPS integrations and staffed support are not implemented.
- Avatar uploads need private Storage rules and a separate upload implementation; profile photo upload is not yet implemented.
- Firebase admin work needs a compatible trusted runtime, credential provisioning and verified Firebase ID tokens. Never grant client write access to balances or real payment status.
- This foundation is not a production or regulatory readiness certification.