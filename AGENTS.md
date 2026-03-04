# AGENTS.md

## Purpose

This file captures durable project learnings, execution conventions, and F-Droid-specific implementation notes for autonomous/iterative agents working on the PearPass Android F-Droid readiness and submission workstream.

Assume each run starts with fresh context. Read this file and `progress.txt` first.

---

## Project Context

* **Repository:** `alvaropaco/pearpass-app-desktop`
* **Primary focus:** Android app F-Droid compatibility, build flavor/channel isolation, and fdroiddata submission readiness
* **Android source-of-truth repo:** `tetherto/pearpass-app-mobile`
* **Goal:** Add/validate an F-Droid-compatible Android build path without regressing Play Store behavior

---

## Working Agreements (Agent Rules)

1. **Preserve Play Store behavior**

   * Any F-Droid-specific behavior should be isolated via flavor/channel config where possible.
   * Avoid broad runtime conditionals if compile-time flavor separation is feasible.

2. **Audit before changing behavior**

   * For credentials/autofill and version-check flows, map actual runtime paths before implementing gating/fallbacks.

3. **Prefer small, reviewable commits**

   * One concern per commit when possible (e.g., flavor scaffolding, version-check behavior, GMS gating, docs).

4. **Document all channel differences**

   * Any functionality reduced/disabled in F-Droid must be explicitly documented.

5. **Do not over-implement non-GMS fallback**

   * Task 5 (non-GMS fallback) is conditional. Only implement if audit + MVP gating prove necessary.

6. **Always leave evidence**

   * Record what was run, what passed/failed, and what remains in `progress.txt`.

---

## First Files to Read Each Iteration

* `progress.txt`
* `AGENTS.md` (this file)
* `docs/adr/*fdroid*` (if present)
* `docs/fdroid/*` (if present)
* Android build config in `pearpass-app-mobile` (Expo config/plugins + generated `android/`)
* Any previous task notes/checklists

---

## Execution Strategy (F-Droid Workstream)

Preferred task order:

1. Compatibility audit
2. F-Droid flavor/channel
3. Version-check compatibility
4. GMS credentials gating (MVP)
5. Non-GMS fallback (only if required)
6. Tags/versioning standardization
7. Store metadata/assets
8. fdroiddata YAML recipe
9. fdroidserver validation
10. Non-GMS smoke test
11. fdroiddata MR + first review iteration
12. Internal docs + release checklist

If blocked:

* Document blocker precisely
* Add a minimal reproducible note / script / checklist
* Move to the next unblocked task only if it does not create rework

---

## F-Droid-Specific Design Preferences

### 1) Flavor/channel isolation (preferred)

Use an Android product flavor (e.g., `fdroid`) to isolate:

* dependencies
* version-check behavior
* credentials/autofill integrations
* endpoints/store links
* feature flags

### 2) Centralized channel config

Prefer one central config source for channel behavior:

* `BuildConfig` fields, and/or
* resources (strings/bools), and/or
* manifest placeholders

Avoid scattering `if (fdroid)` checks across unrelated classes.

### 3) Compile-time separation over runtime branching

Prefer:

* flavor-specific source sets
* no-op implementations
* dependency exclusion by flavor

Over:

* runtime checks that still include GMS artifacts in the F-Droid build

### 4) MVP approach for GMS credentials path

For F-Droid compatibility:

* first try **gating/disable/exclude**
* only build full non-GMS fallback if needed for acceptance/usability

---

## Known Workstream Risks to Watch

1. **Play Services-backed credentials dependency**

   * `androidx.credentials:credentials-play-services-auth` may affect F-Droid acceptance/usability if shipped/invoked in F-Droid build.
   * Need exact declaration + runtime path audit before deciding replacement vs gating.

2. **Version-check / update redirect behavior**

   * F-Droid builds must not redirect users to Play Store.
   * Version-check logic must become channel-aware/configurable.

3. **Build flavor leaks**

   * Ensure F-Droid changes do not alter existing Play variants unexpectedly.
   * Validate both Play and F-Droid build variants in CI/local commands.

