# pear-apps-utils-qr

A lightweight utility package for generating QR codes in SVG format. This package provides a simple Promise-based API to create QR codes for URLs, text, or any other data you need to encode.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)

## Features

- Generate QR codes in SVG format
- Customizable margin settings
- Promise-based API
- Lightweight implementation

## Installation

```bash
npm install pear-apps-utils-qr
```

## Usage Examples

```javascript
import { generateQRCodeSVG } from 'pear-apps-utils-qr';

// Basic usage
generateQRCodeSVG('https://example.com', { type: 'svg', margin: 4 })
    .then(svgString => {
        // Use the SVG string
        console.log(svgString);
    })
    .catch(error => {
        console.error('Error generating QR code:', error);
    });

// With custom margin
const qrOptions = { type: 'svg', margin: 0 };
const svgOutput = await generateQRCodeSVG('Your text here', qrOptions);
```

## Dependencies

- [qrcode](https://www.npmjs.com/package/qrcode) - QR code generation library

## Related Projects

- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A desktop app for PearPass, a password
- [tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.