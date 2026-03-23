#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FLATPAK_DIR="$PROJECT_DIR/flatpak"
BUILD_DIR="$PROJECT_DIR/build/flatpak"

APPIMAGE_PATH=""
ARCH=""
VERSION=""

log_info()  { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
log_ok()    { echo -e "\033[1;32m[OK]\033[0m    $*"; }
log_error() { echo -e "\033[1;31m[ERROR]\033[0m $*"; }

usage() {
    cat <<EOF
Usage: $(basename "$0") --local <AppImage> [--arch arm64|x64]

Options:
  --local <path>   Path to a locally-built AppImage (required)
  --arch <arch>    Target architecture (default: auto-detect)
  -h, --help       Show this help message

Example:
  $(basename "$0") --local ./dist/PearPass-1.6.0-arm64.AppImage
EOF
    exit 0
}

detect_arch() {
    local machine
    machine="$(uname -m)"
    case "$machine" in
        x86_64)  echo "x64" ;;
        aarch64|arm64) echo "arm64" ;;
        *) log_error "Unsupported architecture: $machine"; exit 1 ;;
    esac
}

check_prerequisites() {
    local missing=()
    command -v flatpak         >/dev/null 2>&1 || missing+=("flatpak")
    command -v flatpak-builder >/dev/null 2>&1 || missing+=("flatpak-builder")

    if (( ${#missing[@]} )); then
        log_error "Missing tools: ${missing[*]}"
        log_error "Install with: sudo apt install ${missing[*]}"
        exit 1
    fi

    # Check runtime & SDK
    if ! flatpak info org.gnome.Platform//49 >/dev/null 2>&1; then
        log_error "Missing org.gnome.Platform//49"
        log_error "Install: flatpak install flathub org.gnome.Platform//49"
        exit 1
    fi
    if ! flatpak info org.gnome.Sdk//49 >/dev/null 2>&1; then
        log_error "Missing org.gnome.Sdk//49"
        log_error "Install: flatpak install flathub org.gnome.Sdk//49"
        exit 1
    fi
    log_ok "Prerequisites satisfied"
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --local)  APPIMAGE_PATH="$2"; shift 2 ;;
            --arch)   ARCH="$2"; shift 2 ;;
            -h|--help) usage ;;
            *) log_error "Unknown option: $1"; usage ;;
        esac
    done

    if [[ -z "$APPIMAGE_PATH" ]]; then
        log_error "--local <AppImage> is required"
        usage
    fi

    # Resolve to absolute path
    APPIMAGE_PATH="$(cd "$(dirname "$APPIMAGE_PATH")" && pwd)/$(basename "$APPIMAGE_PATH")"

    if [[ ! -f "$APPIMAGE_PATH" ]]; then
        log_error "AppImage not found: $APPIMAGE_PATH"
        exit 1
    fi

    [[ -z "$ARCH" ]] && ARCH="$(detect_arch)"
    VERSION="$(jq -r '.version' "$PROJECT_DIR/package.json")"
    log_info "AppImage : $APPIMAGE_PATH"
    log_info "Arch     : $ARCH"
    log_info "Version  : $VERSION"
}

prepare_icon() {
    log_info "Extracting and resizing icon from AppImage ..."
    local tmpdir
    local src_icon=""
    tmpdir="$(mktemp -d)"
    cp "$APPIMAGE_PATH" "$tmpdir/PearPass.AppImage"
    chmod +x "$tmpdir/PearPass.AppImage"
    (cd "$tmpdir" && ./PearPass.AppImage --appimage-extract >/dev/null 2>&1)

    local dst_icon="$FLATPAK_DIR/icon-512.png"

    for candidate in \
        "$tmpdir/squashfs-root/resources/assets/linux/icon.png" \
        "$tmpdir/squashfs-root/usr/share/icons/PearPass.png"
    do
        if [[ -f "$candidate" ]]; then
            src_icon="$candidate"
            break
        fi
    done

    if [[ -z "$src_icon" ]]; then
        log_error "Icon not found inside AppImage (checked resources/assets/linux/icon.png and usr/share/icons/PearPass.png)"
        rm -rf "$tmpdir"
        exit 1
    fi

    # Resize to 512x512 using ffmpeg (widely available)
    if command -v ffmpeg >/dev/null 2>&1; then
        ffmpeg -y -i "$src_icon" -vf "scale=512:512" "$dst_icon" 2>/dev/null
    elif command -v convert >/dev/null 2>&1; then
        convert "$src_icon" -resize 512x512 "$dst_icon"
    elif command -v magick >/dev/null 2>&1; then
        magick "$src_icon" -resize 512x512 "$dst_icon"
    else
        log_error "No image resize tool found (need ffmpeg, imagemagick convert, or magick)"
        rm -rf "$tmpdir"
        exit 1
    fi

    rm -rf "$tmpdir"
    log_ok "Icon resized to 512x512: $dst_icon"
}

build_flatpak() {
    log_info "Staging AppImage into flatpak/appimage/ ..."
    mkdir -p "$FLATPAK_DIR/appimage"
    cp "$APPIMAGE_PATH" "$FLATPAK_DIR/appimage/PearPass.AppImage"
    chmod +x "$FLATPAK_DIR/appimage/PearPass.AppImage"

    log_info "Building flatpak ..."
    mkdir -p "$BUILD_DIR"

    flatpak-builder --force-clean \
        --repo="$BUILD_DIR/repo" \
        "$BUILD_DIR/build-dir" \
        "$FLATPAK_DIR/com.pears.pass.yaml"

    log_ok "Build complete. Creating bundle ..."

    local bundle_name="pearpass_${VERSION}_${ARCH}.flatpak"
    flatpak build-bundle \
        "$BUILD_DIR/repo" \
        "$BUILD_DIR/$bundle_name" \
        com.pears.pass

    log_ok "Flatpak bundle: $BUILD_DIR/$bundle_name"
    ls -lh "$BUILD_DIR/$bundle_name"
}

cleanup() {
    log_info "Cleaning staging files ..."
    rm -f "$FLATPAK_DIR/appimage/PearPass.AppImage"
    rm -f "$FLATPAK_DIR/icon-512.png"
}

# ── Main ────────────────────────────────────────────────────────────────
parse_args "$@"
check_prerequisites
prepare_icon
build_flatpak
cleanup

log_ok "Done!"

