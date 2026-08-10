# GreenBox Driver — Android app

A thin native wrapper around the deployed GreenBox web app (`http://62.238.60.178:3000/login`,
Driver tab), built with [Capacitor](https://capacitorjs.com). It's not a
separate app with its own code — it just opens your existing site full-screen,
with a native app icon and no browser address bar. GPS/notifications can be
added later without rebuilding the whole thing.

Distributed as a plain `.apk` file the admin sends directly to drivers
(WhatsApp, a download link, USB...) — no Play Store, no review process.
Drivers enable "install from unknown sources" once, then install the file.

## Building the APK

This can't be built inside the Claude Code sandbox — it has no network
access to Google's Android SDK servers. Build it on your own machine or
your Hetzner server instead (both have normal internet access).

### Option A — your Hetzner server (command line, no GUI needed)

```bash
cd ~/greenbox/driver-app
chmod +x build-apk.sh
./build-apk.sh
```

This installs a local (non-system-wide) Android SDK under `driver-app/android-sdk/`
the first time (~500MB download, one-time), then builds. The finished file
is `android/app/build/outputs/apk/debug/app-debug.apk`.

Copy it to your own machine to distribute it:
```bash
scp root@62.238.60.178:~/greenbox/driver-app/android/app/build/outputs/apk/debug/app-debug.apk .
```

### Option B — Android Studio (any OS, GUI)

1. Install [Android Studio](https://developer.android.com/studio) (it bundles
   everything needed — JDK, SDK, build tools).
2. `File > Open` → select `driver-app/android`.
3. Let it sync (first time takes a few minutes, downloads its own SDK).
4. `Build > Build App Bundle(s) / APK(s) > Build APK(s)`.
5. The APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`.

## Updating the app later

- **To point it at a different URL** (e.g. once you have a real domain with
  HTTPS instead of the bare IP): edit `server.url` in `capacitor.config.json`,
  then run `npx cap sync android` and rebuild.
- **Nothing else needs updating when the web app itself changes** — the APK
  just loads whatever's live on the server. Only rebuild the APK if you change
  the icon, the app name, or the URL it points to.
- **Once you have a real domain + HTTPS**, remove `"cleartext": true` from
  `capacitor.config.json` and `android:usesCleartextTraffic="true"` from
  `android/app/src/main/AndroidManifest.xml` — that flag exists only because
  the app currently points at a bare HTTP IP address.

## Signing for real distribution

`app-debug.apk` is signed with a throwaway debug key — fine for sideloading
to your own drivers' phones. If you ever publish to the Play Store, you'll
need a proper release key (`./gradlew assembleRelease` after configuring
signing in `android/app/build.gradle`) — ask when you get there.
