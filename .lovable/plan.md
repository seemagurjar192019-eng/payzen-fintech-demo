# PayZen: demo se real-app jaisa anubhav (payments simulated hi rahenge)

5 credits limited hain, isliye sabse zyada asar wale kaam ek hi baar me, priority order me. Firebase connection ke bina hosted login test nahi ho sakta; baaki sab abhi ban sakta hai.

## 1. App lock aur security (sabse pehle)
- 4-digit PIN setup jab app pehli baar khule, har payment se pehle PIN maangna.
- App background se wapas aane par lock screen.
- "Demo" label hata kar ek chhota "Test mode" badge (honest rahega, real paisa nahi).

## 2. Settings screen (Profile se khulegi)
- Account: naam, email, verify status, sign out.
- Security: PIN badlo, app lock on/off, auto-lock timer.
- Preferences: currency, dark/light theme, haptics/sound on/off.
- Notifications: payment, request, budget alerts on/off.
- Payment limits: daily send limit (default ₹10,000), har payment par check.
- Privacy: balance chhupao (tap-to-reveal), data export (CSV), sab data reset.
- Help & legal: FAQ, contact support form (local), Terms/Privacy pages, app version.

## 3. Real app jaisa UI/UX
- Home: balance hide/show eye icon, quick actions (Send, Request, Scan, Top-up, Bills).
- Transaction history: search, filter (sent/received/request), date ke hisaab se groups.
- Notifications bell + in-app inbox (payment hua, request aaya, budget cross).
- Empty states, loading skeletons, error messages saaf bhasha me.
- Onboarding: 3 slides pehli baar, phir PIN setup.

## 4. Naye simulated features
- QR: apna QR dikhana + camera scan (simulated recipient).
- Bills & recharge: mobile, electricity, DTH — simulated payment, receipt ke saath.
- Split bill: amount ko contacts me baantna, requests banana.
- Favourite contacts aur payment notes.

## Kya nahi badlega
- Koi real bank/UPI/card payment nahi. Firebase project config milne tak data is browser me hi rahega.

## Technical details
- Naye screens `src/components/payzen/` me (Settings, Lock, Onboarding, Bills, QR, Notifications), single-route state switching jaisa abhi hai.
- PIN: SHA-256 hash (Web Crypto) localStorage me, kabhi plain nahi; 5 galat attempts par 30s lockout.
- Daily limit aur PIN rules pure functions `src/lib/payzen.ts` me, tests ke saath (limit ₹10,000 block, lockout after 5).
- QR scan: dynamic import browser-only library hydration ke baad.
- Settings state `PayState` me extend, purane saved data ke saath compatible.
- roadmap.md update; credits khatam hone par jo bacha uski list.
