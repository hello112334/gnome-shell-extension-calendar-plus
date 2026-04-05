#!/usr/bin/env bash
set -euo pipefail

UUID="calendar-colors@hello112334.github.io"
SCHEMA_ID="org.gnome.shell.extensions.calendarcolors"
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMAS_DIR="$ROOT_DIR/schemas"

open_prefs=0

usage() {
    cat <<'EOF'
Usage: scripts/reload-extension.sh [--open-prefs]

Recompile the extension schema, close stale preferences windows,
disable and re-enable the extension, and optionally reopen preferences.
EOF
}

while (($# > 0)); do
    case "$1" in
    --open-prefs)
        open_prefs=1
        ;;
    -h|--help)
        usage
        exit 0
        ;;
    *)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
    shift
done

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Missing required command: $1" >&2
        exit 1
    fi
}

require_command glib-compile-schemas
require_command gnome-extensions
require_command gsettings

echo "Compiling schemas from $SCHEMAS_DIR"
glib-compile-schemas "$SCHEMAS_DIR"

echo "Checking schema keys"
if ! gsettings --schemadir "$SCHEMAS_DIR" list-keys "$SCHEMA_ID" | grep -qx 'separate-notifications-menu'; then
    echo "Schema reload failed: separate-notifications-menu key not found" >&2
    exit 1
fi

echo "Closing stale GNOME Extensions windows"
pkill -f org.gnome.Extensions || true
pkill -f gnome-extensions-app || true
pkill -f extensionPrefsDialog || true

echo "Reloading extension $UUID"
gnome-extensions disable "$UUID" || true
gnome-extensions enable "$UUID"

if ((open_prefs)); then
    echo "Opening preferences"
    gnome-extensions prefs "$UUID"
fi

cat <<'EOF'
Reload complete.

If the new switch still does not appear:
1. Re-run this script with --open-prefs.
2. If you are on X11, use Alt+F2, then type r, then press Enter.
3. If you are on Wayland, shell UI changes may still require logging out.
EOF
