# Scope 📷

Point your camera at anything → AI identifies it → clean structured result.

Built with Expo SDK 51, React Native 0.74, TypeScript, Expo Router, and Zustand.

---

## Quick start

```bash
npm install
npx expo start
```

Then:
- Press `i` for the iOS simulator
- Press `a` for the Android emulator
- Scan the QR code with the **Expo Go** app on a physical device
- Press `w` for web

No `pod install`. No Android Studio gradle setup. Runs in Expo Go out of the box.

> **Out of the box it runs in mock mode** (`Config.useMock = true` in
> `src/constants/config.ts`), returning sample results so you can test the whole
> flow without a backend. Point `apiBaseUrl` at your server and set
> `useMock = false` to go live.

---

## Important changes from the original spec

The original spec listed a few dependencies that **cannot run** on Expo SDK 51 /
Expo Go. To honor the requirement that the project works with `npx expo start`,
the following pragmatic changes were made:

1. **`expo-ads-admob` removed.** This package was deprecated and dropped from
   Expo years ago; it does not exist for SDK 51, and there is no managed-workflow
   AdMob module. Real ads require `react-native-google-mobile-ads`, which needs a
   custom **development build** (it will not run in Expo Go).
   - `src/services/adService.ts` keeps the same interface but ships as a safe
     placeholder (banner = labeled box, interstitial/rewarded = no-ops that
     resolve). The file documents exactly how to swap in real ads later. The
     AdMob unit ids still live in `src/constants/config.ts`.

2. **`@shopify/react-native-skia` removed.** Skia contains native code and does
   not run in Expo Go (it needs a dev build). The spec itself notes that real
   on-device detection isn't possible in managed workflow and that bounding boxes
   are "visual polish only," so `DetectionBox` / `DetectionBoxPainter` are
   implemented with plain React Native views + Reanimated instead. Same visual
   result, fully Expo Go compatible.

3. **`expo-image-manipulator` added** to dependencies (it was imported by
   `imageHelper.ts` but missing from the original `package.json`).

4. **Mock API mode added** so the app is demoable end-to-end without a server.

Everything else follows the spec's folder structure, models, stores, colors, and
result-card layout.

---

## To enable real ads (later)

1. `npx expo install react-native-google-mobile-ads`
2. Add its config plugin + app ids to `app.json`
3. Build a dev client: `npx expo run:android` / `npx expo run:ios` (or EAS Build)
4. Replace the bodies in `src/services/adService.ts` and the banner in
   `src/components/result/BannerAdWidget.tsx` with the real SDK components. Unit
   ids are already in `Config.*`.

## To connect a real backend

1. Set `apiBaseUrl` in `src/constants/config.ts`
2. Set `useMock: false`
3. The backend should accept `POST /api/v1/scan` with
   `{ image_base64, device_id, language }` and return a `ScanResult`
   (see `src/models/ScanResult.ts`).

---

## Project layout

```
app/                 Expo Router screens (file-based routing)
  (tabs)/camera.tsx  Main camera screen
  (tabs)/history.tsx Scan history
  result.tsx         Result modal sheet
src/components/       UI components (camera / result / history / common)
src/store/            Zustand stores
src/services/         API, storage, ads
src/models/           TypeScript interfaces
src/constants/        colors, config, languages
src/utils/            image + permission helpers
```
