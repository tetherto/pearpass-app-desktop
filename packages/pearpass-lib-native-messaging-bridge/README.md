# pearpass-lib-native-messaging-bridge

Native messaging bridge for PearPass browser extension. This library enables secure communication between the PearPass browser extension and the PearPass desktop application using Chrome's Native Messaging protocol and IPC (Inter-Process Communication).

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)

## Features

- **Chrome Native Messaging Protocol**: Implements Chrome's native messaging protocol for browser-to-native app communication
- **IPC Bridge**: Bridges browser extension messages to the PearPass desktop app via IPC
- **Robust Message Parsing**: Handles Chrome's length header bugs with fallback parsing mechanisms
- **Cross-Platform Support**: Works on macOS (ARM64), Linux (x64), and Windows (x64)
- **Command-Based Architecture**: Supports 50+ predefined commands for encryption, vaults, and password management
- **Connection Status Management**: Monitors and reports desktop app connection status
- **Secure Handshake**: Implements secure pairing and session management (commands 1100-1105)
- **Error Handling**: Comprehensive error handling with timeouts and fallback mechanisms
- **Event-Driven Design**: Uses EventEmitter pattern for clean message handling

## Usage Examples

### Basic Usage

```javascript
import { NativeMessagingHost } from 'pearpass-lib-native-messaging-bridge'

// Create and start the native messaging host
const host = new NativeMessagingHost()
await host.start()
```

### Command Definitions

The bridge supports various command categories:

**Encryption Commands** (1001-1004):
- `encryptionInit`, `encryptionGetStatus`, `encryptionGet`, `encryptionAdd`

**Vaults Commands** (1005-1010):
- `vaultsInit`, `vaultsGetStatus`, `vaultsGet`, `vaultsList`, `vaultsAdd`, `vaultsClose`

**Active Vault Commands** (1011-1019):
- `activeVaultInit`, `activeVaultGetStatus`, `activeVaultGet`, `activeVaultList`, `activeVaultAdd`, `activeVaultRemove`, `activeVaultClose`, `activeVaultCreateInvite`, `activeVaultDeleteInvite`

**Password/Key Commands** (1020-1024):
- `hashPassword`, `encryptVaultKeyWithHashedPassword`, `encryptVaultWithKey`, `getDecryptionKey`, `decryptVaultKey`

**Native Messaging Secure Channel** (1100-1105):
- `nmGetAppIdentity`, `nmBeginHandshake`, `nmFinishHandshake`, `nmSecureRequest`, `nmCloseSession`

### Message Format

Messages follow the native messaging protocol:

```javascript
{
  id: "unique-message-id",
  method: "vaultsList",  // or use "command"
  params: {
    // Command-specific parameters
  }
}
```

Response format:

**Success Response:**
```javascript
{
  id: "unique-message-id",
  success: true,
  result: {
    // Command-specific result data
  }
}
```

**Error Response:**
```javascript
{
  id: "unique-message-id",
  success: false,
  error: "Error message",
  errorCode: "ERROR_CODE"  // Optional error code
}
```

### IPC Configuration

The bridge connects to the desktop app via a socket:

- **Unix/Linux/macOS**: `/tmp/pearpass-native-messaging.sock`
- **Windows**: `\\?\pipe\pearpass-native-messaging`

## Dependencies

### Runtime Dependencies

- **pear-ipc** IPC communication with the desktop app
- **bare-fs** Bare runtime filesystem module
- **bare-os** Bare runtime operating system utilities
- **bare-path** Bare runtime path utilities
- **events** EventEmitter implementation

### Development Dependencies

- **jest** Testing framework
- **babel-jest** Babel integration for Jest
- **@babel/core** & **@babel/preset-env**: Transpilation

### Peer Dependencies

- **tether-dev-docs** Development documentation

## Related Projects

- **PearPass Desktop App**: The main desktop application that manages vaults and encryption
- **PearPass Browser Extension**: Browser extension that uses this native messaging bridge

## License

Apache License 2.0 - See LICENSE file for details.