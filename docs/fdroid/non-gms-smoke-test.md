# Non-GMS smoke test checklist (F-Droid build)

Target: a device/emulator without Google Play Services (or with Play Services removed/disabled).

## Install

* Install the `fdroidRelease` APK (built by fdroidserver).

## Smoke checks

* App launches without crashing.
* Onboarding/login flow works.
* Vault open/unlock works.
* Core record flows work:
  * create/read/update/delete for a login item
  * create/read/update/delete for a note
* Version check:
  * no network fetches to Google Play
  * no redirects to the Play Store
* Autofill/passkeys (as applicable on the device):
  * classic autofill service does not crash
  * credential provider screens load when invoked

## Record findings

Log the following in `progress.txt`:

* device/emulator details
* Android version
* whether Play Services were present
* any crashes/stack traces
* any feature differences vs Play builds

