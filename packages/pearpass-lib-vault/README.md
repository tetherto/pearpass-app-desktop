# pearpass-lib-vault

A secure JavaScript library for managing encrypted vaults in applications. The pearpass-lib-vault provides robust encryption, decryption, and storage capabilities for sensitive data with React and Redux integration. 

This library requires one of the following client implementations to function:
- **pearpass-lib-vault-bare** - For React Native applications
- **pearpass-lib-vault-desktop** - For Pear desktop applications

Without a proper client implementation, the vault operations cannot be performed.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)

## Features

- **Secure Vault Management**
  - Create, list, and access encrypted vaults
  - Password-protected vaults with strong encryption
  - Master password protection for vault access

- **Storage Flexibility**
  - Configurable storage paths
  - Structured data organization

- **React & Redux Integration**
  - Redux state management for vaults
  - React hooks for easy component integration
  - Actions and selectors for state management

- **Comprehensive Testing**
  - Full test coverage with Jest
  - Mocked clients for reliable testing

## Installation

Install via npm:

```bash
npm install pearpass-lib-vault
```

## Usage Examples

### Initializing the Library

```javascript
import { setPearpassVaultClient } from 'pearpass-lib-vault';

// Set up the vault client with your implementation
// Choose one of the client implementations:
import { createPearpassVaultClient } from 'pearpass-lib-vault-bare';
// OR
import { createPearpassVaultClient } from 'pearpass-lib-vault-desktop'

// Initialize the appropriate client
const  vaultClient  = createPearpassVaultClient();

// Set the client for the vault library
setPearpassVaultClient(vaultClient);
```

### Creating a Master Password

```javascript
import { createMasterPassword } from 'pearpass-lib-vault';

// Create a master password to secure all vaults
const encryptionData = await createMasterPassword('your-secure-password');
```

### Using with React Components

```jsx
import React from 'react';
import { useVaults } from 'pearpass-lib-vault';

function VaultManager() {
  const { 
    data: vaults, 
    isLoading, 
    initVaults, 
    refetch 
  } = useVaults({
    onInitialize: (vaults) => console.log('Vaults initialized', vaults),
    onCompleted: (vaults) => console.log('Vaults loaded', vaults)
  });

  // Component implementation...
}
```

### Working with Folders

```jsx
import React from 'react';
import { useCreateFolder, useFolders } from 'pearpass-lib-vault';

function FolderManager() {
  const { data: folders, isLoading } = useFolders({
    variables: { searchPattern: 'personal' }
  });

  const { createFolder, isLoading: isCreatingFolder } = useCreateFolder({
    onCompleted: (payload) => console.log('Folder created:', payload.name),
    onError: (error) => console.error('Error creating folder:', error)
  });

  const handleCreateFolder = () => {
    createFolder('New Personal Folder');
  };

  // Component implementation...
}
```

### Managing Records

```jsx
import React, { useState } from 'react';
import { useCreateRecord, useRecords, useUpdateRecord } from 'pearpass-lib-vault';

function RecordManager({ vaultId }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const { data: records, isLoading, refetch } = useRecords({
    variables: {
      vaultId,
      filters: {
        type: 'login',
        isFavorite: false
      },
      sort: { field: 'title', direction: 'asc' }
    }
  });

  const { createRecord, isLoading: isCreating } = useCreateRecord({
    onCompleted: () => refetch()
  });

  const { updateRecord, updateFavoriteState } = useUpdateRecord({
    onCompleted: () => refetch()
  });

  const handleCreateRecord = () => {
    createRecord({
      title: 'New Login',
      type: 'login',
      fields: {
        username: 'user@example.com',
        password: 'secure-password',
        url: 'https://example.com'
      }
    });
  };

  const handleToggleFavorite = (recordId, currentState) => {
    updateFavoriteState(recordId, !currentState);
  };

  // Component implementation...
}
```

## Dependencies

### Peer Dependencies
- [react](https://reactjs.org/)
- [react-edux](https://react-redux.js.org/)
- [redux-toolkit](https://redux-toolkit.js.org/)

## Related Projects

- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A desktop app for PearPass, a password manager
- [pearpass-lib-vault-bare](https://github.com/tetherto/pearpass-lib-vault) - Client implementation for React Native applications
- [pearpass-lib-vault-desktop](https://github.com/tetherto/pearpass-lib-desktop) - Client implementation for Pear desktop applications
- [pear-apps-utils-validator](https://github.com/tetherto/pear-apps-utils-validator) - A library for validating data in Pear applications
- [tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.