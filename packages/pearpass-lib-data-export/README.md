# pearpass-lib-data-export

A utility for exporting PearPass vaults to various formats.

## Features

- Export vault data to CSV format.
- Export vault data to JSON format.

## Installation

Install the package using npm:

```bash
npm install pearpass-lib-data-export
```

## Testing

To run the tests, use the following command:

```bash
npm test
```

## Usage Examples

Here's how you can use the library to export data:

### Export to JSON

```javascript
import { parseDataToJson } from 'pearpass-lib-data-export';

const vaultData = [
  {
    name: 'My Vault',
    records: [
      {
        type: 'login',
        data: {
          title: 'Sample Login',
          username: 'user',
          password: 'password123'
        }
      }
    ]
  }
];

const files = parseDataToJson(vaultData);
files.forEach(file => {
  console.log(`File: ${file.filename}`);
  // You can now save file.data to a file
});
```

### Export to CSV

```javascript
import { parseDataToCsvText } from 'pearpass-lib-data-export';

const vaultData = [
  {
    name: 'My Vault',
    records: [
      {
        type: 'login',
        data: {
          title: 'Sample Login',
          username: 'user',
          password: 'password123'
        }
      }
    ]
  }
];

const files = parseDataToCsvText(vaultData);
files.forEach(file => {
  console.log(`File: ${file.filename}`);
  // You can now save file.data to a file
});
```

## Related Projects

*   [pearpass-lib-data-import](https://github.com/tetherto/pearpass-lib-data-import)

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.
