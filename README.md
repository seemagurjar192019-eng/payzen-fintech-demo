# PayZen Fintech Demo

LOVABLE MASTER PROMPT — PREMIUM ANIMATED DUMMY PAYMENT APP



Build a fully interactive, mobile-first fintech payment app called PayZen, using the uploaded reference video as the primary visual and animation reference. Recreate its overall UI/UX behavior, layout, transitions, and interaction flow as closely as practical, but use original PayZen branding.



1. DESIGN DIRECTION



Create a premium, modern fintech interface with:



- A near-black and deep charcoal mobile dashboard.

- Bright yellow, turquoise, and electric-blue digital cards.

- A contrasting white transaction sheet with rounded upper corners.

- Minimal typography, compact labels, subtle shadows, and smooth transitions.

- Native-app-like proportions, polished spacing, and touch-friendly controls.

- A clean, light neutral background around the phone interface when viewed on desktop.



Avoid a generic banking template, oversized marketing sections, excessive gradients, and unnecessary decorative elements. Prioritize the reference video's actual app interface.



2. SCREENS AND NAVIGATION



A. Home Dashboard



- Small profile avatar and notification icon.

- Total demo balance with a decimal value.

- Overlapping colorful digital payment cards on the right.

- Two compact actions: Send and Request.

- Spending summary with small circular category icons.

- A white transaction-history panel containing merchant icons, names, dates, and signed amounts.

- A floating bottom navigation bar with Home, Cards, Recipients, and Profile.

- A small search/filter control inside the transaction panel.



B. Digital Cards



- Three vertically stacked, colorful digital cards.

- Yellow, turquoise, and blue card variants.

- Masked demo card numbers, card labels, and small action icons.

- Smooth vertical scrolling and subtle card movement on touch.

- Card actions must remain simulated; never expose real card credentials.



C. Recipients



- A dark background with a title and Add button.

- A grid of circular contact avatars, names, and truncated demo handles.

- A searchable recipient list with a selected-recipient state.

- Include fictional sample contacts.

- Selecting a recipient opens the Send Money screen.



D. Send Money — Custom Calculator



Recreate the reference video's distinctive full-screen amount-entry interface:



- White rounded sheet or full-height mobile panel.

- Send and Request tabs at the top.

- Selected recipient and demo account information.

- A large, animated currency amount display.

- A compact available-demo-balance label.

- Calculator operation buttons: +, −, ×, ÷.

- A custom numeric keypad with decimal and delete controls.

- Smooth number transitions as digits are entered.

- A selected recipient avatar beside the entered amount.

- A swipe-to-confirm interaction at the bottom.



The amount must update live. Validate empty, zero, invalid, and insufficient demo balances. Never allow a transaction to create a negative balance.



E. Payment Confirmation



- Show recipient, amount, and a clear review step before confirmation.

- Require the user to deliberately complete the swipe gesture or tap a confirmation control.

- Add a cancel action.

- Prevent accidental duplicate submissions.



F. Payment Success Animation



Recreate the reference video's full-screen success state:



- Full-screen bright green background.

- Animated checkmark drawn with an SVG stroke.

- Large, smoothly animated payment amount.

- Text such as “Demo payment successful”.

- Recipient name and a randomly generated demo transaction reference.

- A subtle entrance animation and gentle scale transition.

- Tap anywhere to close or return to the dashboard.

- Refresh the dashboard balance and transaction history immediately.



Clearly display “SIMULATION ONLY — NO REAL MONEY TRANSFERRED” on the transaction confirmation and success screens.



G. Request Money



- Select a fictional recipient.

- Enter a demo amount.

- Generate a simulated payment request with Pending status.

- Allow cancellation and viewing of the request.



3. ANIMATIONS AND MICRO-INTERACTIONS



Use Framer Motion for polished, purposeful motion:



- Smooth screen transitions with directional sliding.

- Spring-based bottom-sheet entrance and dismissal.

- Slight parallax or horizontal movement on the overlapping cards.

- Subtle press and release animations on buttons.

- Animated number changes for balance and amount.

- Smooth keypad interactions with immediate visual feedback.

- A draggable swipe-to-confirm control with progress feedback.

- SVG checkmark drawing and success-screen reveal.

- Subtle list-item entrance animations.

- Animated active states for bottom navigation.

- Respect reduced-motion accessibility preferences.



Animations must feel fluid and deliberate, not flashy or distracting. Keep the interface responsive and performant on mobile devices.



4. FUNCTIONAL REQUIREMENTS



- Every visible button, tab, card, icon, and navigation item must perform its intended demo action.

- Implement functional navigation between all screens.

- Use React, TypeScript, Tailwind CSS, and reusable components.

- Use localStorage to persist the demo balance, transactions, and fictional recipients across page refreshes.

- Start with a fictional balance of ₹7,854.43.

- Use INR formatting by default, with a currency selector if practical.

- Support sending, requesting, cancelling, and viewing simulated transactions.

- Generate unique demo transaction references.

- Add loading, success, empty, and validation states where appropriate.

- Make the layout mobile-first, with a responsive desktop preview.

- Use Lucide icons and original, consistent branding.



5. STRICT PAYMENT SAFETY REQUIREMENTS



This is a learning project only. It must not process, initiate, or claim to process real payments.



- Do not connect to UPI, NPCI, bank accounts, payment gateways, cards, or real financial APIs.

- Do not collect real UPI PINs, OTPs, banking passwords, or card credentials.

- Do not imitate real payment confirmation or claim that funds were transferred.

- Keep all recipients, balances, card data, and transactions fictional.

- Clearly label the app and its payment flows as a demo.

- Store only fictional demo state locally.



6. IMPLEMENTATION INSTRUCTIONS



Build the complete working application, not just a static mockup or screenshot. Implement all screens, shared state, interactions, transitions, and simulated payment logic.



Start with the dashboard and complete the entire Send Money flow through the animated success screen. Then implement Cards, Recipients, Request Money, and Profile.



Use the uploaded video as the reference for visual hierarchy, screen composition, and interaction timing. Preserve its compact mobile-app feel while ensuring the result is a coherent, usable PayZen product.



Before finishing, test all navigation, keypad operations, amount validation, balance updates, transaction history, swipe confirmation, success animation, and persistence after refresh.



Final goal: A visually polished, highly interactive fintech demo that captures the reference video's premium mobile UI and animation style without moving real money.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/756890c0-62ca-431a-b6b1-3615aa803b1f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
