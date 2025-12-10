# pearpass-lib-constants

Shared constants for the Pearpass repositories.

## Features

This library provides a centralized collection of constants used across the Pearpass ecosystem.

## Installation

To install the package, you can use npm or yarn:

```bash
npm install pearpass-lib-constants
```

or

```bash
yarn add pearpass-lib-constants
```

## Testing

This project uses ESLint for linting. To run the linter, execute the following command:

```bash
npm run lint
```

## Usage Examples

Here is an example of how to import and use a constant from this library:

```javascript
import { MS_PER_DAY } from 'pearpass-lib-constants';

function isOlderThanADay(timestamp) {
  return Date.now() - timestamp > MS_PER_DAY;
}
```

## Dependencies

This library has no production dependencies.

### Dev Dependencies
- tether-dev-docs

## Related Projects

- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [pearpass-app-browser-extension](https://github.com/tetherto/pearpass-app-browser-extension) - A browser extension for PearPass, a password manager
- [pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A desktop app for PearPass, a password manager

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.
