# pear-apps-utils-pattern-search

A simple utility to search for patterns in a list

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)

## Features

- Case-insensitive pattern searching
- Handles null and undefined values safely
- Simple API with boolean return values
- Zero dependencies
- Lightweight and optimized for performance
- ESM module support

## Installation

```bash
npm install pear-apps-utils-pattern-search
```

## Usage Examples

```javascript
import { matchPatternToValue } from 'pear-apps-utils-pattern-search';

const pattern = 'hello';
const value = 'Hello, World!';

if (matchPatternToValue(pattern, value)) {
  console.log('Pattern found in value');
} else {
  console.log('Pattern not found in value');
}
```

## Dependencies

This package has no external dependencies.

## Related Projects

- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A desktop app for PearPass, a password
- [tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.