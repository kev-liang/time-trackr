# App Store Checklist — TimeTracer

Bundle ID: `com.kliang.timetracer` | Version: `1.0.0` | EAS Project: `904d3d32-5ba9-4205-8b3c-df04da9ba0e0`

---

## Pre-Build

- [ ] Bump version in `app.json` (`version` + iOS `buildNumber` / Android `versionCode`)
- [ ] All `.env.local` keys set (Supabase URL, anon key, PostHog key)
- [ ] `GoogleService-Info.plist` and `google-services.json` present and valid
- [ ] App icon assets present:
  - `assets/images/icon.png` (1024x1024, no alpha, iOS)
  - `assets/images/android-icon-foreground.png`
  - `assets/images/android-icon-background.png`
  - `assets/images/android-icon-monochrome.png`
  - `assets/images/splash-icon.png`
  - `assets/images/favicon.png`
- [ ] Splash screen background color matches brand (`#ffffff`)
- [ ] Privacy manifest aggregation enabled (already set in `app.json`)

---

## EAS Build

```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production
```

- [ ] iOS build succeeds (`.ipa`)
- [ ] Android build succeeds (`.aab`)
- [ ] Test production build on a real device before submitting

---

## iOS — App Store Connect

### App Record
- [ ] App created in App Store Connect (bundle ID: `com.kliang.timetracer`)
- [ ] App name: **TimeTracer**
- [ ] Primary language set
- [ ] Category set (e.g., Productivity)
- [ ] Content rights confirmed (no third-party content)

### App Information
- [ ] Privacy policy URL provided
- [ ] Age rating questionnaire completed
- [ ] App contains no objectionable content

### Version Metadata
- [ ] Screenshots uploaded for required device sizes:
  - iPhone 6.9" (1320x2868 or 1290x2796)
  - iPhone 6.5" (1284x2778 or 1242x2688)
  - iPad Pro 13" (if `supportsTablet: true`)
- [ ] App preview video (optional)
- [ ] App description written (up to 4000 chars)
- [ ] Keywords (up to 100 chars)
- [ ] Support URL
- [ ] Marketing URL (optional — `https://timetrackr.app` or similar)
- [ ] What's new text (for updates)

### Privacy & Permissions
- [ ] Privacy nutrition labels filled in App Store Connect:
  - Notifications usage declared
  - Analytics/usage data (PostHog) declared
  - Auth data (Supabase anonymous + Apple Sign-In) declared
- [ ] NSUserNotificationUsageDescription present (done in `app.json`)
- [ ] Apple Sign-In entitlement configured in EAS / Apple Developer portal

### Submission
- [ ] Binary uploaded via `eas submit --platform ios` or Transporter
- [ ] Export compliance (encryption): answer HTTPS-only = No encryption exempt
- [ ] Build selected in App Store Connect version
- [ ] Submitted for review

---

## Android — Google Play Console

### App Record
- [ ] App created in Play Console (package: `com.kliang.timetracer`)
- [ ] App name: **TimeTracer**
- [ ] Default language set
- [ ] App category: Productivity (or similar)

### Store Listing
- [ ] Short description (up to 80 chars)
- [ ] Full description (up to 4000 chars)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (min 2):
  - Phone: at least 2 screenshots
  - Tablet: recommended if targeting tablets
- [ ] App icon (512x512, PNG, no alpha)
- [ ] Privacy policy URL

### Content Rating
- [ ] Content rating questionnaire completed in Play Console

### Privacy & Data Safety
- [ ] Data safety form completed:
  - Notifications (no personal data collected)
  - Analytics (PostHog — usage data, not shared with third parties)
  - Authentication data (Supabase)
  - App activity (activities logged by user — stored on device + Supabase)

### Release
- [ ] `.aab` uploaded to internal testing track first
- [ ] Internal test passed on real Android device
- [ ] Promoted to production track
- [ ] Rollout percentage set (start at 20% recommended)

---

## Post-Launch

- [ ] Monitor crash reports (EAS / Sentry / Crashlytics if added)
- [ ] Confirm PostHog events flowing in production
- [ ] Confirm Supabase anonymous auth working in production
- [ ] Confirm push notifications work on production build
- [ ] App Store rating prompt considered (expo-store-review)
- [ ] Marketing website live and linked from store listings
