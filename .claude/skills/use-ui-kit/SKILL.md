---
name: use-ui-kit
description: Use whenever creating or editing UI in this repo — React components, modals, dialogs, forms, buttons, inputs, typography, styling, icons, or any .tsx/.jsx work. The repo uses `@tetherto/pearpass-lib-ui-kit` as the single source for UI primitives; do not roll custom ones. Load this before suggesting any UI change, especially when touching src/components, src/containers/Modal, or src/pages.
---

<!-- Mirror of AGENTS.md at repo root — keep in sync. AGENTS.md is the canonical copy; this file exists so Claude Code's skill-trigger mechanism can lazy-load the same content on UI work. -->

# UI conventions for pearpass-app-desktop-tether

This is the Electron desktop app for PearPass. It's written in React + TypeScript. UI is built on the shared component library `@tetherto/pearpass-lib-ui-kit`.

This document is for **anyone contributing UI** to the repo — new hires, current engineers, and AI coding assistants (Claude Code, Cursor, Codex, etc.). It captures the component catalog, styling conventions, file-naming rules, and patterns we use when building UI in this app. Read it once before your first UI change; keep it open when you're in doubt.

## File naming

Files use their natural names — no version suffixes. A few small components (`InputField`, `NoticeText`, `PearPassPasswordField`, `TextArea`) still live under [src/lib-react-components/components/](../../../src/lib-react-components/components/) as a legacy holdover, but that tree is frozen — don't add to it.

## Golden rules

1. **Check the catalog below before creating any component.** If it exists in the kit, use it — never wrap or reimplement.
2. **All new UI goes through the kit.** Any new `.tsx`/`.jsx` file — suffixed or not — must import from `@tetherto/pearpass-lib-ui-kit`, not from [src/lib-react-components/](../../../src/lib-react-components/).
3. **Never add variants under [src/lib-react-components/components/](../../../src/lib-react-components/components/)** (`ButtonThin`, `ButtonPrimary`, `ButtonRoundIcon`, `PearPassInputField`, etc.). That tree is legacy; the kit's `Button` takes variants.
4. **Style with tokens.** Use `useTheme()` + `rawTokens`. No hardcoded hex colors or px spacing.
5. **Icons come from the kit.** `@tetherto/pearpass-lib-ui-kit/icons` has 530 icons. Do not add new SVGs under `src/`.
6. **If the kit lacks something you need, stop and ask the user.** Don't silently roll a custom component.

## Component catalog (31 components)

Import pattern: `import { ComponentName } from '@tetherto/pearpass-lib-ui-kit'`

### Actions
- `Button` — all CTAs. Takes variants; use instead of `ButtonThin`, `ButtonPrimary`, `ButtonSecondary`, `ButtonRoundIcon`, `ButtonLittle`, `ButtonFilter`, `ButtonFolder`, `ButtonRadio`, `ButtonSingleInput`, `ButtonCreate`.
- `Pressable` — low-level pressable wrapper for custom interactive elements.
- `Link` — text links.

### Forms
- `Form` — form wrapper with validation.
- `InputField` — text input. Use instead of `PearPassInputField`.
- `PasswordField` — password input with strength indicator. Use instead of the legacy `PearPassPasswordField`.
- `SearchField` — search input.
- `SelectField` — dropdown select.
- `Dropdown` — low-level dropdown primitive.
- `TextArea` — multiline text input.
- `Checkbox`
- `Radio`
- `ToggleSwitch`
- `Slider`
- `DateField`
- `AttachmentField`
- `UploadField`
- `MultiSlotInput` — split inputs for OTP / recovery codes. Use instead of custom `OtpCodeField`.
- `FieldError` — inline field validation error.

### Typography
- `Title` — headings.
- `Text` — body text.

### Layout / surfaces
- `Dialog` — modals. Use instead of custom `ModalContent` wrappers.
- `NativeBottomSheet` — bottom sheets.
- `PageHeader` — top-of-page header.
- `ItemScreenHeader` — item-detail header.
- `Breadcrumb`
- `ListItem`
- `NavbarListItem`
- `ContextMenu`

### Feedback
- `AlertMessage` — inline alerts. Reference: [src/pages/WelcomePage/CardCreateMasterPassword/index.tsx](../../../src/pages/WelcomePage/CardCreateMasterPassword/index.tsx).
- `Snackbar` — toast-style notifications.
- `PasswordIndicator` — standalone password strength meter.

### Type exports
- `ThemeColors`, `Theme`, `ThemeType`, `RawTokens`
- `PasswordIndicatorVariant` — `'vulnerable' | 'decent' | 'strong'`

Import types with `import type { ... } from '@tetherto/pearpass-lib-ui-kit'`.

## Component props (15 most-used)

Required props have no `?`. **Always include a test ID on interactive components** — see the "Test IDs" section below for which prop to use per component.

- **Button** — `variant: 'primary' | 'secondary' | 'tertiary' | 'destructive'`, `size: 'small' | 'medium'`, `onClick`, `children`, `type?: 'button' | 'submit'`, `disabled?`, `isLoading?`, `iconBefore?`, `iconAfter?`, `data-testid?`. Icon-only buttons need `aria-label`.
- **Dialog** — `title` (ReactNode), `onClose?`, `open?`, `footer?`, `children?`, `closeOnOutsideClick?`, `hideCloseButton?`, `trapFocus?`, `initialFocusRef?`, `testID?`, `closeButtonTestID?`. Put action buttons in `footer`.
- **InputField** — `label`, `value`, `onChange?: (e) => void`, `placeholder?`, `error?: string`, `inputType?: 'text' | 'password'`, `disabled?`, `readOnly?`, `copyable?`, `onCopy?`, `leftSlot?`, `rightSlot?`, `testID?`.
- **PasswordField** — `label`, `value`, `onChange?`, `placeholder?`, `error?`, `passwordIndicator?: 'vulnerable' | 'decent' | 'strong' | 'match'`, `infoBox?: string`, `copyable?`, `testID?`.
- **SearchField** — `value`, `onChangeText` (yes, this one is still current), `placeholderText?`, `size?: 'small' | 'medium'`, `testID?`.
- **Form** — `children`, `onSubmit?`, `noValidate?`, `testID?`. Wrap fields here; pair with `useForm` from `@tetherto/pear-apps-lib-ui-react-hooks`.
- **Text** — `children`, `as?: 'p' | 'span'`, `variant?: 'label' | 'labelEmphasized' | 'body' | 'bodyEmphasized' | 'caption'`, `color?`, `numberOfLines?`, `data-testid?`.
- **Title** — `children`, `as?: 'h1' | 'h2' | ... | 'h6'`, `data-testid?`.
- **AlertMessage** — `variant: 'info' | 'warning' | 'error'`, `size: 'small' | 'medium' | 'big'`, `title`, `description`, `actionText?`, `onAction?`, `testID?`, `actionTestId?`.
- **ToggleSwitch** — `checked?`, `onChange?: (b: boolean) => void`, `label?`, `description?`, `disabled?`, `data-testid?`.
- **Checkbox** — same shape as `ToggleSwitch` (uses `data-testid`).
- **Radio** — `options: Array<{value, label?, description?, disabled?}>`, `value?`, `onChange?: (v: string) => void`, `testID?`.
- **SelectField** — `label`, `value?`, `placeholder?`, `onClick?` (opens dropdown), `error?`, `disabled?`, `leftSlot?`, `rightSlot?`, `testID?`.
- **TextArea** — `value`, `onChange?`, `label?`, `placeholder?`, `error?`, `disabled?`, `testID?`.
- **Link** — `children`, `href?`, `isExternal?`, `onClick?`, `data-testid?` (and standard `<a>` attributes).

For components not listed, open `node_modules/@tetherto/pearpass-lib-ui-kit/dist/components/<Name>/types.d.ts`.

### Test IDs — `testID` vs `data-testid`

Always include a test ID on anything a user interacts with (buttons, fields, toggles, dialogs). Which prop depends on the component:

- **`testID`** — components that declare it explicitly: `Dialog` (+ `closeButtonTestID`), `Form`, `InputField`, `PasswordField`, `SearchField`, `SelectField`, `TextArea`, `Radio`, `AlertMessage` (+ `actionTestId`).
- **`data-testid`** — components that extend native HTML and don't redeclare it: `Button`, `ToggleSwitch`, `Checkbox`, `Link`, `Pressable`, `Text`, `Title`.

Rule of thumb: try `testID` first; if TypeScript rejects it, use `data-testid`. When editing an existing file, follow the naming pattern already there.

### Prop naming — modern vs. deprecated (important)

The kit recently renamed several field props. **Use the modern names:**

| Use | Not (deprecated) |
| --- | --- |
| `onChange` (receives `ChangeEvent`) | `onChangeText` (receives string) |
| `placeholder` | `placeholderText` |
| `error` (string) | `errorMessage` + `variant` |

⚠️ **Some existing files in this repo (e.g. `CreateOrEditVaultModalContent`, `CardCreateMasterPassword`) still use the deprecated props.** Don't copy their prop names blindly — use the modern ones in new code. The deprecated props still work for now but will be removed.

**Exception:** `SearchField` still uses `onChangeText` + `placeholderText` — those aren't deprecated there. `testID` is current everywhere.

## Theming

The codebase does **not** use styled-components. The convention is a `createStyles(colors)` factory that returns plain inline-style objects, consumed via `style={styles.foo}`.

**In the component** (reference: `src/pages/WelcomePage/CardCreateMasterPassword/index.tsx`):

```tsx
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { createStyles } from './styles'

const Component = () => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  return <div style={styles.card}>…</div>
}
```

**In the companion `styles.ts`** (reference: `src/pages/WelcomePage/CardCreateMasterPassword/styles.ts`):

```ts
import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  card: {
    background: colors.colorSurfacePrimary,
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: `${rawTokens.radius8}px`,
    padding: `${rawTokens.spacing24}px`,
    gap: `${rawTokens.spacing12}px`,
  },
})
```

### `rawTokens` — flat, numeric-suffixed keys (not nested)

- Spacing: `spacing2`, `spacing4`, `spacing6`, `spacing8`, `spacing10`, `spacing12`, `spacing16`, `spacing20`, `spacing24`, `spacing32`, `spacing40`, `spacing48` (all `number`, multiply with `${n}px`)
- Radius: `radius8`, `radius16`, `radius20`, `radius26`
- Font size: `fontSize12`, `fontSize14`, `fontSize16`, `fontSize24`, `fontSize28`
- Font family: `fontPrimary` (`"Inter"`), `fontDisplay` (`"Humble Nostalgia"`)
- Weight: `weightRegular` (`"400"`), `weightMedium` (`"500"`)

### `theme.colors` — common keys seen in this repo

`colorSurfacePrimary`, `colorSurfaceHover`, `colorBorderPrimary`, `colorBorderSecondary`, `colorTextPrimary`, `colorTextSecondary`, `colorTextTertiary`, `colorLinkText`. If you need one you haven't seen, inspect the `ThemeColors` type from `@tetherto/pearpass-lib-ui-kit`.

### When hardcoded values are OK

Tokens cover the design-system primitives. Feature-specific layout values (a card's `maxWidth: '500px'`, a one-off `padding: '55px 0'`) are fine as literals — these aren't design tokens. **Rule of thumb:** if the value corresponds to a semantic design decision (spacing step, brand color, radius), it must come from a token.

## Icons

```tsx
import { Add, Download, Folder, OpenInNew } from '@tetherto/pearpass-lib-ui-kit/icons'
```

530 icons, mostly Material Design, with style variants as suffixes: `Filled`, `Outlined`, `Round`, `Sharp`, `Tone` (e.g. `LockFilled`, `InfoOutlined`, `KeyboardArrowRightRound`). If a name has no suffix, it exists as a single variant.

**Commonly used in this repo** (check these first before browsing):

- **Actions:** `Add`, `Download`, `ContentCopy`, `Share`, `Send`, `Swap`, `UploadFileFilled`
- **Folder / organization:** `Folder`, `FolderOpen`, `FolderCopy`, `CreateNewFolder`, `Layers`
- **Navigation / arrows:** `KeyboardArrowRightFilled`, `KeyboardArrowRightRound`, `KeyboardArrowLeftFilled`, `ExpandMore`
- **Status / feedback:** `InfoOutlined`, `ReportProblemRound`, `ErrorFilled`, `Check`, `DoneAll`, `CheckBox`
- **Security:** `LockFilled`, `Key`, `SecurityFilled`, `Fingerprint`, `TwoFactorAuthenticationFilled`
- **External / misc:** `ImportOutlined`, `OpenInNew`

**Discovering others:** `ls node_modules/@tetherto/pearpass-lib-ui-kit/dist/icons/components/ | grep -i <keyword>` — names are PascalCase, grep is case-insensitive friendly.

## Anti-patterns to avoid

When creating new UI or editing existing files, do **not**:

- Add a new file under `src/lib-react-components/components/` for a Button/Input/Modal variant.
- Import `PearPassPasswordField` or anything else from `src/lib-react-components/` into a new file — swap to the kit equivalents.
- Add a `V2` (or any version) suffix to a new file. Use natural names.
- Use native `<button>`, `<input>`, or `<dialog>` in production code (tests are fine).
- Hardcode hex colors, brand radii, or design-system spacing — use `rawTokens` and `theme.colors`. (Feature-specific layout literals like `maxWidth: '500px'` are fine.)
- Add new SVG files under `src/` when the kit's icons subpath covers them.
- Introduce `styled-components` — the convention is `createStyles(colors)` returning plain style objects.

## When the kit truly lacks something

1. Confirm by grepping `node_modules/@tetherto/pearpass-lib-ui-kit/dist/components/` for the concept.
2. Check if a composition of existing kit primitives covers it (e.g. `Pressable` + `Text` + tokens).
3. If still missing, surface it to the user: "The kit doesn't export X — options are (a) compose from Y + Z, (b) request X be added upstream, (c) temporary local component. Which?" Do not silently create (c).
