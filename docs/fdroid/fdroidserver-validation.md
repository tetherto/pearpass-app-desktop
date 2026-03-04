# fdroidserver validation (repro steps)

This project drafts the `fdroiddata` metadata file in `docs/fdroid/fdroiddata/com.pears.pass.yml`.

## Quick container-based run (recommended)

On a machine with Docker:

```bash
git clone --depth=1 https://gitlab.com/fdroid/fdroidserver ~/fdroidserver
git clone https://gitlab.com/fdroid/fdroiddata ~/fdroiddata

cp docs/fdroid/fdroiddata/com.pears.pass.yml ~/fdroiddata/metadata/com.pears.pass.yml

sudo docker run --rm -itu vagrant --entrypoint /bin/bash \
  -v ~/fdroiddata:/build:z \
  -v ~/fdroidserver:/home/vagrant/fdroidserver:Z \
  registry.gitlab.com/fdroid/fdroidserver:buildserver
```

Inside the container:

```bash
. /etc/profile
cd /build
fdroid readmeta
fdroid rewritemeta com.pears.pass
fdroid lint com.pears.pass
fdroid checkupdates --allow-dirty com.pears.pass
fdroid build com.pears.pass
```

## Notes

* Upstream is an Expo project, so the recipe runs `expo prebuild` in `prebuild:` before Gradle executes.
* The dedicated Android build type is `fdroidRelease`.

