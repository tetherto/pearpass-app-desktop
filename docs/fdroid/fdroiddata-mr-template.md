# fdroiddata MR template (com.pears.pass)

## Summary

Adds PearPass (`com.pears.pass`) to F-Droid.

## Build

* Upstream: https://github.com/tetherto/pearpass-app-mobile
* Android build uses Expo prebuild + Gradle build type `fdroidRelease`.

## F-Droid-specific behavior

* F-Droid build does not redirect to the Play Store for updates.
* F-Droid build excludes the Play Services-backed credentials auth dependency.

## Verification

* `fdroid readmeta`
* `fdroid lint`
* `fdroid build`
* Non-GMS smoke test results (attach)

