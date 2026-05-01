# pearpass-app-desktop-tether

## UI: always use `@tetherto/pearpass-lib-ui-kit`

UI is built on `@tetherto/pearpass-lib-ui-kit`. All new UI — v2 redesigns of existing screens and net-new features — **must** use components from this kit. Do not roll custom buttons, inputs, modals, typography, or icons.

**Full guide:** the component catalog, props, styling conventions, and reference files live in [AGENTS.md](AGENTS.md) (canonical contributor doc, also loaded by Codex/Cursor). Claude Code's skill trigger loads the same content via [.claude/skills/use-ui-kit/SKILL.md](.claude/skills/use-ui-kit/SKILL.md) whenever you're editing `.tsx`/`.jsx` files.

**Hard rules:**
- If a component exists in the kit, use it. If it does not, raise it with the team before creating a local alternative.
- Do **not** add new files under [src/lib-react-components/components/](src/lib-react-components/components/) — that tree is legacy (v1) and should not grow.
- Style with `useTheme()` + `rawTokens` from the kit. No hardcoded hex colors or design-system spacing.
- Import icons from `@tetherto/pearpass-lib-ui-kit/icons` (530 available). Do not add new SVGs under `src/`.

**When the kit applies:** the active design is controlled by the `DESKTOP_DESIGN_VERSION` flag from `@tetherto/pearpass-lib-constants`. Currently `DESKTOP_DESIGN_VERSION === 2`, so kit components are the default for all new UI.

**`V2` suffix is for coexistence only.** If a v1 file already exists for the component you're creating, add the `V2` suffix (e.g. `CardCreateMasterPasswordV2` alongside legacy `CardCreateMasterPassword`). If the component is net-new with no v1 sibling, use its natural name — **no suffix**.

## React: `useEffect` dependency safety

Before adding a function to a `useEffect` dependency array, verify it is stable (memoized with `useCallback`, a `useRef`-held ref, or a module-level constant). Un-memoized functions are recreated on every render and will cause the effect to fire on every render, producing an infinite loop. If the function is not memoized: wrap it in `useCallback` if it lives in this repository, or omit it from the dependency array if it comes from an external package/repository (where you cannot control memoization).
