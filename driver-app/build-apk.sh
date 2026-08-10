#!/usr/bin/env bash
# Builds android/app/build/outputs/apk/debug/app-debug.apk.
# Installs a local, throwaway Android SDK under ./android-sdk on first run
# (does not touch any system-wide Android SDK). Safe to re-run.
set -euo pipefail
cd "$(dirname "$0")"

CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
SDK_DIR="$(pwd)/android-sdk"
PLATFORM="android-35"
BUILD_TOOLS="35.0.0"

echo "==> Installing npm dependencies..."
npm install

echo "==> Syncing Capacitor (regenerates android/capacitor-cordova-android-plugins, gitignored on purpose)..."
npx cap sync android

echo "==> Checking Java..."
if ! command -v java >/dev/null 2>&1 || [ "$(java -version 2>&1 | grep -oE '"[0-9]+' | head -1 | tr -d '"')" -lt 17 ]; then
  echo "==> Installing OpenJDK 17..."
  apt-get update -qq && apt-get install -y -qq openjdk-17-jdk-headless
fi

if [ ! -d "$SDK_DIR/cmdline-tools/latest" ]; then
  echo "==> Downloading Android command-line tools (one-time, ~150MB)..."
  mkdir -p "$SDK_DIR/cmdline-tools"
  curl -fSL "$CMDLINE_TOOLS_URL" -o /tmp/cmdline-tools.zip || {
    echo "!! Download failed. Get the current URL from:"
    echo "   https://developer.android.com/studio#command-line-tools-only"
    echo "   (the 'Linux' link under Command line tools only), then re-run:"
    echo "   curl -fSL <url> -o /tmp/cmdline-tools.zip && unzip -q /tmp/cmdline-tools.zip -d '$SDK_DIR/cmdline-tools' && mv '$SDK_DIR/cmdline-tools/cmdline-tools' '$SDK_DIR/cmdline-tools/latest'"
    exit 1
  }
  unzip -q /tmp/cmdline-tools.zip -d "$SDK_DIR/cmdline-tools"
  mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
  rm /tmp/cmdline-tools.zip
fi

export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
SDKMANAGER="$SDK_DIR/cmdline-tools/latest/bin/sdkmanager"

echo "==> Installing SDK platform/build-tools (accepting licenses)..."
yes | "$SDKMANAGER" --licenses >/dev/null 2>&1 || true
"$SDKMANAGER" "platform-tools" "platforms;$PLATFORM" "build-tools;$BUILD_TOOLS"

echo "sdk.dir=$SDK_DIR" > android/local.properties

echo "==> Building debug APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo
echo "==> Done. APK at:"
echo "    $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
