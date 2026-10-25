<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- PayZen is a single-route app: screens switch via local state in src/components/payzen to preserve the compact mobile experience.
- Firebase account initialization occurs only after hydration through dynamic imports; account-owned profiles are separate from local payment sandbox state to prevent accidental migration or ownership claims.
- Firestore profiles require verified-email owner access and field validation; browser ledger writes remain denied because financial state needs a trusted authoritative service.
- Firebase configuration is public VITE environment configuration; private service-account credentials must never enter browser code.
- Pure payment rules (calculator, validation) live in src/lib/payzen.ts with tests beside it.
- Sandbox top-up transitions, monthly aggregation and receipt generation live in a browser-safe pure module with adjacent tests; wallet tools remain explicitly simulated and local until Firebase's authoritative wallet service exists.
