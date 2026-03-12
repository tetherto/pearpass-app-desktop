<p align="center">
  <img src="assets/images/logo.png" alt="Pearpass logo" width="264"/>
</p>

# pearpass-app-desktop

PearPass is a distributed password manager powered by Pear Runtime. It allows secure storage of passwords, credit card details, and secure notes, with the ability to distribute data across multiple devices.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Testing](#testing)
- [Usage Examples](#usage-examples)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)

## Features

- Secure password, identity, and credit card, notes and custom fields storage
- Cross-device and platform synchronization
- Offline access to your credentials
- Encryption for data security
- Password strength analysis
- Random password generator
- Easy-to-use interface

## Installation

- **Node.js**: Ensure you have the correct Node.js version installed. You can check the required version in the `.nvmrc` file. And ensure it matches to your current node version  by running:
```bash
node --version
```

- **Pear**: Ensure you have Pear installed mode details can be found [here](https://docs.pears.com/guides)


Clone the repository

```bash
git clone git@github.com:tetherto/pearpass-app-desktop.git
```
Go to the cloned directory 
```bash
cd pearpass-app-desktop
```
Install npm modules
```bash
npm install
```
generate translation keys
```bash
npm run build
```
run the app
```bash
npm run dev
```

## Testing

### Unit Testing

Run unit tests with Jest:

```bash
npm test
```

## Staging to dev

Ensure the app runs correctly using `npm run dev`.

If successful, stage it—for example: `pear stage dev`.

Then run the app: `pear run pear://GENERATED_URL`.

Pear serves files from the "dist" folder:

```html
<!-- index.html -->
<script type="module" src="./dist/app.js"></script>
```

The "src" folder is for development and it's ignored in package.json

```json
  "ignore": [
    ".github",
    "appling",
    ".git",
    ".gitignore",
    "packages",
    "src"     
  ]
```

## Depended modules

The following sibling modules must be present in the workspace (they are not declared as npm dependencies):

- [`tether-dev-docs`](../tether-dev-docs)
- [`pear-apps-lib-feedback`](../pear-apps-lib-feedback)
- [`pear-apps-lib-ui-react-hooks`](../pear-apps-lib-ui-react-hooks)
- [`pear-apps-utils-avatar-initials`](../pear-apps-utils-avatar-initials)
- [`pear-apps-utils-date`](../pear-apps-utils-date)
- [`pear-apps-utils-generate-unique-id`](../pear-apps-utils-generate-unique-id)
- [`pear-apps-utils-pattern-search`](../pear-apps-utils-pattern-search)
- [`pear-apps-utils-qr`](../pear-apps-utils-qr)
- [`pear-apps-utils-validator`](../pear-apps-utils-validator)
- [`pearpass-lib-constants`](../pearpass-lib-constants)
- [`pearpass-lib-data-export`](../pearpass-lib-data-export)
- [`pearpass-lib-data-import`](../pearpass-lib-data-import)
- [`pearpass-lib-ui-theme-provider`](../pearpass-lib-ui-theme-provider)
- [`pearpass-lib-vault`](../pearpass-lib-vault)
- [`pearpass-lib-vault-core`](../pearpass-lib-vault-core)
- [`pearpass-utils-password-check`](../pearpass-utils-password-check)
- [`pearpass-utils-password-generator`](../pearpass-utils-password-generator)

## Dependencies

- [Pear Runtime](https://pears.com/)
- [React](https://reactjs.org/)
- [Styled Components](https://styled-components.com/)
- [Lingui](https://lingui.dev/)
- [Redux](https://redux.js.org/)

## Related Projects

- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [pearpass-lib-ui-react-native-components](https://github.com/tetherto/pearpass-lib-ui-react-native-components) - A library of React Native UI components for PearPass
- [pearpass-lib-ui-react-components](https://github.com/tetherto/pearpass-lib-ui-react-components) - A library of React UI components for PearPass
- [pearpass-app-browser-extension](https://github.com/tetherto/pearpass-app-browser-extension) - A browser extension for PearPass, a password manager
- [tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers
- [pearpass-lib-vault](https://github.com/tetherto/pearpass-lib-vault) - A library for managing password vaults
- [pearpass-lib-vault-core](https://github.com/tetherto/pearpass-lib-vault-core) - A bare worker and a client for PearPass vaults

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.