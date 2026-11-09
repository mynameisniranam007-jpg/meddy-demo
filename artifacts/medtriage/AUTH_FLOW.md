# Authentication and caregiver flow

GitHub Pages remains a presentation demo. Without `EXPO_PUBLIC_AUTH_API_URL`, accounts, passwords, OTP challenges, health profiles, booking drafts and appointments live only in this browser/app session's memory. Refreshing the app clears them. No real SMS or email is sent. The recovery screen displays a clearly marked demo code. Never use real medical information or a password reused elsewhere.

## Navigation

Welcome → Guest triage → results → hospital → choose doctor/time → confirm → login/register → optional profile setup → resume the original booking selection → explicit confirmation. Emergency hospital guidance and the emergency phone action do not require authentication. The backend must enforce auth and patient ownership independently of this UI.

The profile setup screen offers Skip. Saving basic information requires a display name and contact phone. History, national ID, birth date and allergy information can be completed later. Missing allergies remain unknown, never inferred as no allergy. Family member creation requires the caregiver to confirm permission, and booking records include patientId, patientName and caregiverId. Family information stays in memory in the demo; a production service must validate caregiver authority and persist records under access control.

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
2. Select hospital/date/time, confirm as Guest, register with fictional data. Skip optional profile data and return to the same selected booking.
3. Add/select a family member. Supply name/contact, confirm the booking, verify the QR details identify that patient.
4. Open Forgot Password from login in the same demo session. Request the demo code, test wrong/short code, complete reset and sign in with the new password. Used OTPs cannot be reused.
5. Log out: all health profiles, symptoms, photos, appointment and pending navigation clear. The entry screen appears. Reload also clears the demo account registry.
6. Validate native biometric opt-in, app restart, refresh rotation, cancellation, enrollment changes and logout on physical iOS/Android devices when an Auth API is available.
