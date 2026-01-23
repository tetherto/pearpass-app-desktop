# PearPass Appling

Pear Appling installer for PearPass Desktop application.

## Overview

This is a self-contained installer (Appling) that bootstraps the Pear platform and installs PearPass Desktop. The installer:

1. Checks if the Pear platform is already installed
2. If not, downloads and installs the Pear platform via P2P bootstrap
3. Pre-loads the PearPass application
4. Launches PearPass once installation is complete

### Architecture

```
app.cjs                 # Entry point - calls install with app ID
lib/
├── install.cjs         # Main orchestration - UI and worker coordination
├── preflight.cjs       # Pre-installation checks and platform resolution
├── worker.cjs          # Background worker for heavy I/O operations
├── progress.cjs        # Multi-stage progress tracking
├── utils.cjs           # JSON encoding/decoding and formatting utilities
├── view.html.cjs       # HTML/CSS/JS for installer UI
└── icons/              # Platform-specific application icons
```

## Prerequisites

- Node.js 22.0.0 or later (required for `using` keyword support)
- `bare-build` (installed globally)

## Development Setup

```sh
# Install bare-build globally
npm install --global bare-build

# Install dependencies
npm install
```

## Building

### macOS (Apple Silicon)

```sh
bare-build --host=darwin-arm64 --icon lib/icons/darwin/icon.png app.cjs
```

### macOS (Intel)

```sh
bare-build --host=darwin-x64 --icon lib/icons/darwin/icon.png app.cjs
```

### Linux

```sh
bare-build --host=linux-x64 --icon lib/icons/linux/icon.png --package app.cjs
```

### Signed macOS Build

See the CI workflow (`.github/workflows/build-appling.yaml`) for full signing, notarization, and DMG creation instructions.

## Security Considerations

The macOS build requires specific entitlements (`entitlements.plist`) to function with Hardened Runtime. These entitlements are documented in the plist file itself. Key points:

- **Library validation is disabled** - Required for native Node.js addons
- **DYLD environment variables are allowed** - Required for Bare runtime

See `entitlements.plist` for detailed security documentation.

## License

Apache-2.0
