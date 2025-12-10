# pearpass-lib-vault-mobile

A bare runtime focused library for managing encrypted password vaults for Pearpass. This library provides a secure way to store, encrypt, and manage password vaults.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)

## Features

- Secure password vault creation and management
- Local encryption and decryption
- Event-based updates
- Vault sharing via invite codes
- Debug mode for development

## Installation

```bash
npm install pearpass-lib-vault-mobile
```

## Usage Examples

### Initialize a vault client
```javascript
import { createPearpassVaultClient } from 'pearpass-lib-vault-mobile';

// Create a new client with a storage path
const client = createPearpassVaultClient('/path/to/storage', {
    debugMode: false // Set to true for verbose logging
});
```

### Encryption for vault key
```javascript
const password = 'my-secure-password';

// hashing the password 
const { hashedPassword, salt } = await client.hashPassword(password);

// Generate a random encryption key
const { ciphertext, nonce } = await client.encryptVaultKeyWithHashedPassword(hashedPassword);

// Encrypt existing vault key 
const { ciphertext, nonce } = await client.encryptVaultWithKey(hashedPassword, key);
```

### Decryption for vault key
```javascript
// Get hashed password from user input
const hashedPassword = await client.getDecryptionKey({salt, password});

// Decrypt the vault key
const key = await client.decryptVaultKey({ciphertext, nonce, hashedPassword});
```

### Working with vaults
```javascript
// Initialize encryption
await client.encryptionInit();

// Initialize vaults storage
await client.vaultsInit();


// Store vault info
await client.vaultsAdd('vault/my-vault', {
    id: 'my-vault',
    name: 'My Password Vault',
    hashedPassword,
    ciphertext,
    nonce,
    salt,
});

// Initialize active vault
await client.activeVaultInit({
    id: vaultId,
    encryptionKey: key
});

// Add an entry to the vault
await client.activeVaultAdd(`record/${vaultId}`, {
    name: 'GitHub',
    username: 'user@example.com',
    password: 'secure-password'
});

// Retrieve passwords
const github = await client.activeVaultGet(`vault/${vaultId}`);
console.log(githubPassword);

// Close connections when done
await client.closeAllInstances();
```

## Dependencies

- [Autopass](https://github.com/holepunchto/autopass)
- [Corestore](https://github.com/holepunchto/corestore)
- [Bare Crypto](https://github.com/holepunchto/bare-crypto)
- [Bare FS](https://github.com/holepunchto/bare-fs)
- [Bare Path](https://github.com/holepunchto/bare-path)
- [Bare RPC](https://github.com/holepunchto/bare-rpc)
- [Sodium Native](https://github.com/sodium-friends/sodium-native)
- [UDX Native](https://github.com/holepunchto/udx-native)
- Node.js Events

## Related Projects

- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A desktop app for PearPass, a password manager
- [pearpass-lib-vault](https://github.com/tetherto/pearpass-lib-desktop) - Library for managing encrypted vaults in applications
- [pearpass-lib-vault-desktop](https://github.com/tetherto/pearpass-lib-desktop) - Client implementation for desktop applications
- [tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.