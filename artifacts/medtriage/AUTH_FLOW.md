# Authentication and caregiver flow

GitHub Pages remains a presentation demo. Without `EXPO_PUBLIC_AUTH_API_URL`, the prototype stores a versioned local snapshot (Guest triage/result, booking draft, active family profile, demo identity and appointments) in AsyncStorage/localStorage and restores it before mounting screens. Demo accounts persist separately using a random 16-byte salt and PBKDF2-HMAC-SHA256 password verifier (100,000 iterations); plaintext passwords are never saved. OTP challenges/reset tokens remain ephemeral and must be requested again if the recovery page is reloaded. This client-only demonstration is not a production authentication or health-record security boundary; persisted health profiles are not encrypted. No real SMS or email is sent. The recovery screen displays a clearly marked demo code. Never use real medical information or a password reused elsewhere.

## Navigation

Welcome → Guest triage → results → hospital → choose doctor/time → confirm → login/register → optional profile setup → resume the original booking selection → explicit confirmation. Emergency hospital guidance and the emergency phone action do not require authentication. The backend must enforce auth and patient ownership independently of this UI.

The profile setup screen offers Skip, which opens Home immediately and leaves a Continue card for the pending booking. Basic information uses separate firstName and lastName inputs with shared legacy fullName normalization, plus a contact phone. History, national ID, birth date and allergy information can be completed later. Missing allergies remain unknown, never inferred as no allergy. Family member creation requires the caregiver to confirm permission, and booking records include patientId, patientName and caregiverId. The prototype persists family information locally; a production service must validate caregiver authority and store records under access control. The consultation payload is built for the currently selected patient, and a medical-history popup requires non-empty conditions and drugAllergies (unknown is accepted) before showing the demo call.

## HTTPS auth adapter contract

Set `EXPO_PUBLIC_AUTH_API_URL` to an auth service base URL. This URL is public configuration, never a secret. No production auth server is included in this static frontend change. All endpoints accept JSON via POST:

- `/register`: `{identifier,password,displayName}` → AuthSession, after identity verification defined by the service.
- `/login`: `{identifier,password}` → AuthSession.
- `/password/request`: `{identifier}` → `{challengeId}`. Send a six digit code over the registered email/SMS channel. Return the same generic result for nonexistent accounts.
- `/password/verify`: `{challengeId,otp}` → `{resetToken}`. Enforce expiry, attempt limits and single use server side.
- `/password/reset`: `{resetToken,password}` → `{}`. Consume the token, invalidate existing sessions and send a security notification.
- `/session/refresh`: `{refreshToken}` → AuthSession with rotated refresh token.
- `/logout`: `{refreshToken}` → `{}` and revoke the session.

AuthSession: `{userId,identifier,displayName,accessToken,refreshToken}`. Authentication, credential hashing, verification of contact channels, rate limiting and caregiver/health data authorization belong on the server. Do not return `demoOtp` from the real service. Do not store or log passwords or health information in client analytics.

## Biometrics

Native builds use expo-local-authentication and expo-secure-store. Users opt in after password login. Only a refresh token is saved with requireAuthentication, never a password. Explicit logout clears the token; next app launch can restore a session by Face ID/Touch ID through the login button, which refreshes against the server. This requires a configured Auth API, enrolled device biometrics and a development/production native build (Face ID cannot be validated in the web demo). Biometrics cancellation or unavailable hardware falls back to password login. The browser demo reports the feature unavailable and never fakes a biometric success.

## Manual walkthrough

1. Select Guest and enter symptoms. No profile prompt appears before booking confirmation.
2. Select hospital/date/time, confirm as Guest, register with fictional data. Skip opens Home immediately; Continue restores the selected booking and the same triage sample. Refresh at login/setup/booking and verify the pending data remains.
3. Add/select a family member. Supply name/contact, confirm the booking, verify the QR details identify that patient.
4. Open Forgot Password from login with a demo account saved in this device. Request the demo code, test wrong/short code, complete reset and sign in with the new password. Used OTPs cannot be reused.
5. Log out: all health profiles, symptoms, photos, appointment and pending navigation clear. The entry screen appears. Demo account verifiers remain so the user can log in or recover the password later; health/session data is removed. Clear app/site data to delete the local demo account registry.
6. Validate native biometric opt-in, app restart, refresh rotation, cancellation, enrollment changes and logout on physical iOS/Android devices when an Auth API is available.

## Regression checks

Run `pnpm --filter @workspace/medtriage test:auth` for persisted password-reset/reload, name migration, malformed storage, triage continuation and active-patient booking/consultation binding tests. Run `typecheck` and Expo web export before deployment. Input forms share one KeyboardAwareScrollViewCompat per Screen; standalone AuthField/PatientProfileEditor forms use KeyboardAwareForm, avoiding nested scroll views per field. Web visualViewport padding and native keyboard-aware scrolling keep lower actions reachable. Validate real keyboard interactions on iOS/Android devices separately.

ThaID and หมอพร้อม remain visible as external identity options with an explicit not-connected notice. No LINE login or OTP-based sign-in is introduced. Production refresh/access tokens are excluded from AsyncStorage snapshots.
