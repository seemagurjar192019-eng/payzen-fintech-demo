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

- PayZen is a single-route app: screens switch via local state in src/components/payzen; demo state persists in localStorage via src/lib/use-payzen.ts (no backend, never real payments).
- Pure payment rules (calculator, validation) live in src/lib/payzen.ts with tests beside it.
