# PayZen production roadmap

Payment processing remains simulated. Firebase is the selected account and storage provider. Do not claim regulated or partner-dependent features are live.

- [ ] Authentication and security (1–20): Firebase login, profiles, recovery, verified email; advanced MFA, SMS, device and biometric security need provider/native setup.
- [ ] Wallet (21–40): account-owned simulation, atomic ledger, duplicate protection, top-ups, budgets; production ledger needs trusted server implementation.
- [ ] QR and contacts (41–60): QR scanning, payment links, recipient verification; UPI and mandates need bank partners.
- [ ] Cards (61–80): persistent simulation controls; issuance, NFC and real card actions need issuer/native integration.
- [ ] Bills and recharges (81–100): simulated bill workflows; actual bill fetching and settlement need biller agreements.
- [ ] Social payments (101–120): splits, groups, notes and settlement tracking.
- [ ] Analytics (121–140): categories, budgets, insights and forecasts; AI needs a separately authorized service.
- [ ] Rewards (141–160): simulated rewards and redemption; funded offers need partners and abuse controls.
- [ ] Support and audit (161–180): tickets, export and audit records; staffed support, legal policies and fraud operations need business input.
- [ ] Experience (181–200): accessibility, languages, offline handling, notifications and installability; native-only capabilities need a native app.

## Current implementation slice
- [ ] Firebase-ready email/password and Google account flow with honest unconfigured state.
- [ ] Profile read/save and password recovery integration.
- [ ] Owner-only Firestore rules and setup guide.
- [ ] Validate available UI flows and tests.

## External blockers
- Firebase project has not been created: web app configuration, Auth providers, authorized domains and deployed Firestore rules are required before hosted login/profile checks.
- Real payments, card issuance, UPI, BBPS and mandates require provider contracts and compliance review; remain disabled/simulated.
- All 200 features are not implemented in this slice. Remaining tracks require follow-up implementation after the account foundation is connected.