import type { AuthSession } from "./auth";
// Browser demo has no WebAuthn verification server. Never simulate a biometric success.
export async function biometricAvailable() {
  return false;
}
export async function enableBiometrics(_session: AuthSession) {
  throw new Error(
    "Face ID / Touch ID ใช้ได้ในแอปมือถือที่ติดตั้งและเชื่อม Auth API แล้ว",
  );
}
export async function biometricSession(): Promise<AuthSession> {
  throw new Error("เบราว์เซอร์นี้ยังไม่รองรับการเข้าสู่ระบบด้วย biometrics");
}
export async function clearBiometrics() {}
