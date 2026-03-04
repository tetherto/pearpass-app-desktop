# F-Droid release checklist

## Before tagging

* Update `mobile/app.json`:
  * `expo.version` (`versionName`)
  * `expo.android.versionCode` (monotonic)
* Update changelog:
  * `mobile/fastlane/metadata/android/en-US/changelogs/<versionCode>.txt`
* Verify F-Droid channel behavior:
  * update check disabled
  * no Play Store redirects
  * `credentials-play-services-auth` excluded from `fdroidRelease`

## Tag

* Create a tag `vX.Y.Z` on the release commit.

## Validate

* Run fdroidserver validation steps from `docs/fdroid/fdroidserver-validation.md`.
* Run the non-GMS smoke test from `docs/fdroid/non-gms-smoke-test.md`.

## Submit

* Update the `fdroiddata` metadata YAML (`metadata/com.pears.pass.yml`) to point at the tagged release.
* Open/refresh the fdroiddata merge request.

