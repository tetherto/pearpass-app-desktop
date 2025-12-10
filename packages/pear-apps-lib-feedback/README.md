# Pear Apps Feedback Library

A lightweight JavaScript library for collecting and submitting user feedback from various applications to different destinations like Slack and Google Forms. This library provides a consistent interface for sending bug reports, feature requests, and security issues across mobile, desktop, and browser extension applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Dependencies](#dependencies)
- [Testing](#testing)
- [Related Projects](#related-projects)

## Features

- Send feedback directly to Slack channels
- Submit feedback to Google Forms
- Customizable fields and formatting
- Support for different application types (Mobile, Desktop, Browser Extension)
- Support for different feedback types (Bug Reports, Feature Requests, Security Issues)
- Highly configurable for different use cases
- No external dependencies

## Installation

Install the package via npm:

```bash
npm install pear-apps-lib-feedback
```

## Usage Examples

### Sending Feedback to Slack

```javascript
import { sendSlackFeedback } from 'pear-apps-lib-feedback';

// Send a bug report to Slack
sendSlackFeedback({
  webhookUrPath: '/T00000000/B00000000/xxxxxxxxxxxxxxxxxxxxxxxx',
  topic: 'BUG_REPORT',
  app: 'MOBILE',
  operatingSystem: 'iOS 15.4',
  deviceModel: 'iPhone 13',
  message: 'The app crashes when I tap on the settings button',
  appVersion: '1.2.3'
});
```

### Sending Feedback to Google Forms

```javascript
import { sendGoogleFormFeedback } from 'pear-apps-lib-feedback';

// Send a feature request to Google Forms
sendGoogleFormFeedback({
  formKey: '1FAIpQLSd8X-xxxxxxxxxxxxxxxxxxxxxxxxxxx',
  mapping: {
    timestamp: 'entry.1111111111',
    topic: 'entry.2222222222',
    app: 'entry.3333333333',
    operatingSystem: 'entry.4444444444',
    deviceModel: 'entry.5555555555',
    message: 'entry.6666666666',
    appVersion: 'entry.7777777777'
  },
  topic: 'FEATURE_REQUEST',
  app: 'DESKTOP',
  operatingSystem: 'Windows 11',
  deviceModel: 'HP Pavilion',
  message: 'I would love to have dark mode in the next update',
  appVersion: '2.1.0',
  additionalFields: [
    { key: 'entry.8888888888', value: 'Additional info' }
  ]
});
```

## API Reference

### `sendSlackFeedback(config)`

Sends feedback to a Slack channel using a webhook.

**Parameters:**

- `config` (Object):
  - `webhookUrPath` (string): The path part of the Slack webhook URL
  - `topic` (string, optional): Type of feedback ('BUG_REPORT', 'FEATURE_REQUEST', 'SECURITY_ISSUE')
  - `app` (string, optional): Type of app ('MOBILE', 'DESKTOP', 'BROWSER_EXTENSION')
  - `operatingSystem` (string, optional): OS information
  - `deviceModel` (string, optional): Device model information
  - `message` (string): The feedback message content
  - `appVersion` (string, optional): Version of the app
  - `customFields` (Array, optional): Additional fields to include in the message
  - `additionalAttachment` (Object, optional): Additional attachment properties

### `sendGoogleFormFeedback(config)`

Sends feedback to a Google Form.

**Parameters:**

- `config` (Object):
  - `formKey` (string): The key of the Google Form
  - `mapping` (Object, optional): Maps feedback fields to Google Form entry IDs
  - `topic` (string, optional): Type of feedback ('BUG_REPORT', 'FEATURE_REQUEST', 'SECURITY_ISSUE')
  - `app` (string, optional): Type of app ('MOBILE', 'DESKTOP', 'BROWSER_EXTENSION')
  - `operatingSystem` (string, optional): OS information
  - `deviceModel` (string, optional): Device model information
  - `message` (string): The feedback message content
  - `appVersion` (string, optional): Version of the app
  - `additionalFields` (Array, optional): Additional fields to include in the form submission

## Dependencies

This library has no external runtime dependencies.

## Testing

The library includes unit tests for all functionality. To run the tests:

```bash
npm test
```

## Related Projects

- [pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A mobile app for PearPass, a password manager
- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.