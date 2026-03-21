#!/bin/bash
# PearPass Desktop - Create Linux tar.gz archive from AppImage
# Creates a consistent archive structure for Flatpak/Snapcraft builds
#
# Usage:
#   ./scripts/create-linux-tarball.sh [--appimage PATH] [--arch x64|arm64] [--output DIR]
#
# Default:
#   --appimage: appling/PearPass.AppImage
#   --arch: auto-detect from current system
#   --output: build/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Default values
APPIMAGE_PATH="${PROJECT_ROOT}/appling/PearPass.AppImage"
ARCH=""
OUTPUT_DIR="${PROJECT_ROOT}/build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

detect_arch() {
    local machine=$(uname -m)
    case "$machine" in
        x86_64) echo "x64" ;;
        aarch64|arm64) echo "arm64" ;;
        *) log_error "Unsupported architecture: $machine"; exit 1 ;;
    esac
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --appimage)
                APPIMAGE_PATH="$2"
                shift 2
                ;;
            --arch)
                ARCH="$2"
                shift 2
                ;;
            --output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 [--appimage PATH] [--arch x64|arm64] [--output DIR]"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    if [[ -z "$ARCH" ]]; then
        ARCH=$(detect_arch)
    fi
}

main() {
    parse_args "$@"

    # Validate AppImage exists
    if [[ ! -f "$APPIMAGE_PATH" ]]; then
        log_error "AppImage not found: $APPIMAGE_PATH"
        exit 1
    fi

    log_info "Using AppImage: $APPIMAGE_PATH"
    log_info "Target architecture: $ARCH"

    # Create temp directory for extraction
    EXTRACT_DIR=$(mktemp -d)
    TARBALL_DIR=$(mktemp -d)
    trap "rm -rf '$EXTRACT_DIR' '$TARBALL_DIR'" EXIT

    # Extract AppImage
    log_info "Extracting AppImage..."
    cd "$EXTRACT_DIR"
    chmod +x "$APPIMAGE_PATH"
    "$APPIMAGE_PATH" --appimage-extract > /dev/null 2>&1

    # Create tarball structure
    mkdir -p "$TARBALL_DIR/lib"
    mkdir -p "$TARBALL_DIR/pear-pass"

    # Find and copy binary
    log_info "Copying binary..."
    BINARY_PATH=$(find squashfs-root -name "pear-pass" -type f -executable 2>/dev/null | head -n 1)
    if [[ -z "$BINARY_PATH" ]]; then
        BINARY_PATH=$(find squashfs-root -name "pearpass" -type f -executable 2>/dev/null | head -n 1)
    fi
    if [[ -n "$BINARY_PATH" ]]; then
        cp "$BINARY_PATH" "$TARBALL_DIR/pearpass"
        chmod +x "$TARBALL_DIR/pearpass"
        log_info "  Found binary: $BINARY_PATH"
    else
        log_error "Could not find main binary in AppImage"
        log_info "Available executables:"
        find squashfs-root -type f -executable
        exit 1
    fi

    # Find and copy app.bundle
    log_info "Copying app.bundle..."
    BUNDLE_PATH=$(find squashfs-root -name "app.bundle" -type f 2>/dev/null | head -n 1)
    if [[ -n "$BUNDLE_PATH" ]]; then
        cp "$BUNDLE_PATH" "$TARBALL_DIR/pear-pass/app.bundle"
        log_info "  Found bundle: $BUNDLE_PATH"
    else
        log_warn "app.bundle not found in AppImage"
    fi

    # Find and copy native .so libraries
    log_info "Copying native libraries..."
    SO_COUNT=0
    while IFS= read -r -d '' so_file; do
        cp "$so_file" "$TARBALL_DIR/lib/"
        ((SO_COUNT++))
    done < <(find squashfs-root -name "*.so" -type f -print0 2>/dev/null) || true
    log_info "  Copied $SO_COUNT libraries"

    # Show contents
    log_info "Archive contents:"
    find "$TARBALL_DIR" -type f | sed 's|'"$TARBALL_DIR"'|  |'

    # Create output directory and tarball
    mkdir -p "$OUTPUT_DIR"
    TARBALL_NAME="PearPass.linux.${ARCH}.bin.tar.gz"
    cd "$TARBALL_DIR"
    tar -czvf "$OUTPUT_DIR/$TARBALL_NAME" . > /dev/null

    log_info "Created: $OUTPUT_DIR/$TARBALL_NAME"
    log_info "Done!"
}

main "$@"

