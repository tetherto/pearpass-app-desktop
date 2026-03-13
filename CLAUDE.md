# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PearPass Desktop is a distributed password manager powered by Pear Runtime. It's a React/TypeScript monorepo with 17 internal packages that runs on Pear Runtime (not standard Electron).

## Key Commands

```bash
# Development
npm install                    # Install dependencies
npm run update-submodules      # Update git submodules to latest main
npm run dev                    # TypeScript watch + Pear dev mode (primary dev command)

# Building
npm run build                  # Compile TypeScript to dist/
npm run build:pear             # Extract/compile lingui + TypeScript build

# Linting & Testing
npm run lint                   # Run ESLint on src/
npm run lint:fix               # Auto-fix ESLint issues
npm test                       # Run Jest unit tests

# Internationalization
npm run lingui:extract         # Extract translation strings
npm run lingui:compile         # Compile translations to JS
```

## Architecture

### Directory Structure
- `src/` - Main application source (components, containers, pages, services, hooks, context, utils)
- `packages/` - 17 monorepo packages (ignored in production builds)
- `dist/` - Compiled TypeScript output (used by Pear Runtime)
- `appling/`, `snapcraft/`, `flatpak/` - Platform-specific build configs

### Core Packages
- `pearpass-lib-vault` - Vault management with Redux integration
- `pearpass-lib-vault-core` - Bare wrapper for vault (hypercore, hyperswarm, rocksdb)
- `pearpass-lib-constants` - Shared constants
- `pearpass-lib-data-import/export` - Data import/export
- `pearpass-utils-password-*` - Password generation and validation

### Technology Stack
- React 19.1 + TypeScript 5.9
- Redux Toolkit + React Redux for state
- Styled Components for styling
- Lingui for i18n (JSON format, English only)
- sodium-native for cryptography
- Pear Runtime with Pear Bridge/Electron

### Context Providers (in app)
LoadingProvider → ThemeProvider → VaultProvider → I18nProvider → ToastProvider → RouterProvider → ModalProvider

## Development Notes

- **Submodules**: Run `npm run update-submodules` after clone to get latest package versions
- **Native deps**: Several packages have native C++ dependencies (sodium-native, rocksdb-native)
- **Pear global**: Tests mock `Pear.config.tier: 'dev'` - the Pear global is available at runtime
- **Pre-commit**: Husky runs `npm run lint` before commits

## Pre-PR Checklist

```bash
npm run lint      # Must pass
npm test          # Must pass
```

PRs should be focused on single features/bug fixes with clear descriptions.
