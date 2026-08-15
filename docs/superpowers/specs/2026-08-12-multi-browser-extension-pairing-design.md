# Multi-browser extension pairing

Date: 2026-08-12
Status: approved

## Problem

The desktop app can be paired with exactly one browser extension. Pairing a
second browser is rejected outright: `nmGetAppIdentity` throws
`CLIENT_ALREADY_PAIRED` when a different extension key arrives while the
existing pairing is confirmed. Users who run Chrome and Firefox, or two Chrome
profiles, must unpair one to use the other.

The transport is not the limitation. `setupNativeMessaging` already installs the
native-messaging manifest for Chrome, Edge, Chromium, Brave and Firefox on every
supported platform, and `sessionStore` already holds any number of concurrent
sessions. The limitation is that exactly one client identity can be pinned:

- `nm.client.data` stores a single `{ publicKey, pairingState }` object.
- `localStorage.NM_CLIENT_PUBLIC_KEY` caches a single key for the locked-state
  `checkExtensionPairingStatus` check.
- `beginHandshake` folds that one pinned key into the signed transcript, and
  `nmFinishHandshake` verifies signatures against it.

## Goals

- Pair any number of browser extensions at once.
- Authorize each new browser with a fresh single-use code.
- List paired browsers with user-chosen labels; unpair them individually.
- Keep a global off-switch with today's full-teardown semantics.
- Do not break extensions that have not yet shipped the protocol change.

## Non-goals

- Changing how the native-messaging manifest or bridge is installed.
- Per-browser permissions or scoping. Every paired browser has the same access.
- Syncing the paired-browser list across devices.

## Architecture

Two new modules under `src/services/security/`, each owning one document in the
encrypted store. `appIdentity.js` sheds its client-pinning half and keeps only
host identity, fingerprints and pairing-code derivation. This follows the
existing `sessionStore` / `sessionManager` split in the same directory.

The encrypted store exposes only `get`/`add` by key — there is no enumeration
API — so each collection lives under a single key as a JSON document.

### `pairedClients.js` — `nm.clients`

```json
{
  "version": 1,
  "clients": [
    {
      "publicKey": "<base64 ed25519>",
      "label": "Chrome — work laptop",
      "pairingState": "PENDING" | "CONFIRMED",
      "pairedAt": "2026-08-12T09:00:00.000Z",
      "inviteId": "a1b2c3d4"
    }
  ]
}
```

Exports: `listClients`, `listConfirmedClients`, `getClient`, `addPendingClient`,
`confirmClient`, `removeClient`, `clearClients`.

Pending entries older than the invite TTL are pruned on every read, so a pairing
that starts and never confirms does not leave a permanent row.

### `pairingInvites.js` — `nm.pairing.invites`

```json
{
  "version": 1,
  "invites": [
    {
      "id": "a1b2c3d4",
      "secretB64": "<32 random bytes>",
      "label": "Chrome — work laptop",
      "createdAt": "…",
      "expiresAt": "…",
      "consumedBy": null
    }
  ]
}
```

Exports: `mintInvite`, `getInviteCode`, `findLiveInviteByCode`, `consumeInvite`,
`listLiveInvites`, `clearInvites`.

The code shown to the user is `getPairingCode(hostEd25519PublicKey,
invite.secretB64)` — the existing derivation, fed a per-invite secret instead of
one global `nm.identity.pairingSecret`. It stays deterministic from the stored
secret, so reopening the modal re-shows the same code; single use is enforced by
`consumedBy`, not by discarding the secret. Invites expire after 10 minutes.
Expired and consumed invites are pruned on read.

### Storage invariants

- **Write serialization.** Both documents are read-modify-write over one key.
  Each module funnels writes through an internal promise chain so two extensions
  confirming simultaneously cannot clobber each other.
- **Migration.** On first read of `nm.clients` when the document is absent, if
  `nm.client.data` holds a `CONFIRMED` publicKey, seed the list with it (label
  `Browser`, `pairedAt` from `nm.identity.creationDate`). `nm.client.data` is
  left in place so a rollback still finds it.
- **Locked-state cache.** `LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEY` (one string)
  is superseded by `NM_CLIENT_PUBLIC_KEYS` (JSON array). The old key is read as a
  fallback and folded into the array on first write.

### Bug fixed in passing

`getPairingCode` contains a stray `input.set(publicKey, secret.length)` — a
leftover from before the domain-separation tag was added. It overwrites 23 of
the 32 secret bytes with the public key, cutting the secret's contribution to
about 9 bytes. It is removed. Existing deterministic codes change as a result,
which is harmless: one-time invites replace them.

## Protocol

### Minting an invite

"Add browser" prompts for a label, calls `mintInvite(label)` and shows the
returned code. The host identity is untouched; `resetIdentity` is no longer part
of the add-a-browser path.

### `nmGetAppIdentity({ pairingToken, clientEd25519PublicKeyB64 })`

The `CLIENT_ALREADY_PAIRED` throw is replaced by:

1. Resolve `pairingToken` against every live invite (unexpired, unconsumed),
   case-insensitively. No match → `INVALID_PAIRING_TOKEN`.
2. If this public key is already in `nm.clients`, return the host identity
   without consuming the invite. Re-pairing a browser you already have is a
   no-op, not an error.
3. Otherwise append `{ publicKey, label: invite.label, pairingState: PENDING,
   inviteId }` and mark the invite `consumedBy` this key.

The invite is consumed at identity time rather than confirm time, closing the
window where two browsers race on the same code.

### `nmConfirmPairing({ clientEd25519PublicKeyB64 })`

Flips that client to `CONFIRMED`, appends the key to `NM_CLIENT_PUBLIC_KEYS`,
and dispatches a `extension-paired` window event so the UI can refresh.

### `nmBeginHandshake({ extEphemeralPubB64, clientEd25519PublicKeyB64? })`

The only extension-facing contract change, with a backward-compatible fallback:

- Parameter present → look the client up; it must be `CONFIRMED`, else
  `NOT_PAIRED`.
- Parameter absent → if exactly one confirmed client exists, use it, so
  extensions that have not shipped the change keep working. If two or more
  exist, throw the new `AMBIGUOUS_CLIENT` code, whose message tells the user to
  update the extension.

The transcript keeps its shape — `host_eph_pk || ext_eph_pk ||
client_ed25519_pk` — and the same binding. Only the resolution of which client
key goes in changes. The resolved key is stored on the session.

### `nmFinishHandshake`

Verifies against `session.clientPublicKey` instead of the globally pinned key.
No extension change: the signature it already sends covers the same bytes.

### `checkExtensionPairingStatus`

Becomes a membership test against the `NM_CLIENT_PUBLIC_KEYS` array, so it still
works while the vault is locked.

### `nmResetPairing`

Deleted. It is registered as a handler but has no entry in
`COMMAND_DEFINITIONS`, so it is unreachable over IPC — dead code that would
unpair every browser if it ever became reachable.

### Sessions

`sessionStore` records `clientPublicKey` on each session and gains
`closeSessionsForClient(publicKey)`. `clearAllSessions` remains for the global
off-switch.

### Revocation

- **Unpair one browser:** remove from `nm.clients`, remove from
  `NM_CLIENT_PUBLIC_KEYS`, `closeSessionsForClient`. The IPC server, manifests
  and host identity are untouched; other browsers keep working.
- **Global off:** today's teardown (stop IPC, kill host, remove manifests, reset
  identity) plus clearing both new documents and the localStorage array.

## UI

### Hooks

`useConnectExtension` keeps the actions — `enableBrowserExtension`,
`disableBrowserExtension`, `addBrowser`, `unpairBrowser`,
`isBrowserExtensionEnabled`. A new `usePairedBrowsers` owns list state:
`browsers`, `isLoading` and a memoized `refresh`.

Pairing completes over IPC, which React cannot observe. `nmConfirmPairing`
dispatches `window.dispatchEvent(new Event('extension-paired'))`, mirroring the
existing `reset-timer` event. `usePairedBrowsers` subscribes, so a new row
appears as soon as the browser confirms. `refresh` is wrapped in `useCallback`
before entering any dependency array.

### `YourDevicesContent`

The hardcoded single row becomes a map over `browsers`, each a `ListItem` with
the browser label as `title`, the pairing date as `subtitle`, and a
`ContextMenu` → destructive "Unpair" in `rightElement`. Below the list: a
tertiary "Add Browser Extension" button (always available, so a second browser
is one click), and a destructive "Turn off browser extension connections" button
— the only control that resets the host identity. The existing empty state stays,
with its CTA rewired to `addBrowser`.

### `AddBrowserModalContent`

New modal under `src/containers/Modal/`: a `Dialog` with one `InputField` for
the label (blank falls back to `Browser N`), Cancel/Continue footer. Continue
mints the invite and replaces the modal with the existing pairing modal.

### `ExtensionPairingModalContent`

Gains `label` and `expiresAt` props: shows which browser the code is for and a
countdown, since codes now expire. Its copy/discard footer is unchanged.

All components come from `@tetherto/pearpass-lib-ui-kit`; no new primitives.

## Error handling

| Situation | Behavior |
| --- | --- |
| Code typed after expiry | `INVALID_PAIRING_TOKEN`; user mints a new one |
| Code reused by a second browser | `INVALID_PAIRING_TOKEN` (already consumed) |
| Already-paired browser re-runs pairing | Succeeds, no state change, invite preserved |
| Old extension, one browser paired | Handshake succeeds via fallback |
| Old extension, two browsers paired | `AMBIGUOUS_CLIENT`, message says to update |
| Handshake naming an unknown/pending key | `NOT_PAIRED` |
| Corrupt `nm.clients` JSON | Treated as empty, logged; migration re-seeds |

## Testing

- `pairedClients`: add/confirm/remove, pending pruning, migration from
  `nm.client.data`, concurrent writes serialize, corrupt JSON tolerated.
- `pairingInvites`: mint/derive/verify, single use, expiry, pruning.
- `SecurityHandlers`: full two-browser pairing, invite reuse rejection,
  handshake with and without the client-key parameter, ambiguity error,
  per-client finish verification.
- `sessionStore`: `closeSessionsForClient` closes only that client's sessions.
- `usePairedBrowsers`: refresh on `extension-paired`.
- `YourDevicesContent`: renders N rows, unpair calls through, add opens modal.
- Existing `SecurityHandlers.test.js`, `useConnectExtension.test.js` and
  `YourDevicesContent/index.test.tsx` updated for the new surface.
