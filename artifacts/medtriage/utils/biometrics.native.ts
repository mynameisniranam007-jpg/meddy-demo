import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { AuthSession, refreshSession } from "./auth";
const KEY = "medtriage.biometric.refresh";
export async function biometricAvailable() {
  return (
    (await LocalAuthentication.hasHardwareAsync()) &&
    (await LocalAuthentication.isEnrolledAsync())
  );
}
export async function enableBiometrics(session: AuthSession) {
  if (!session.refreshToken)
    throw new Error("ต้องเชื่อม Auth API จริงก่อนเปิดการเข้าสู่ระบบครั้งถัดไป");
  if (!(await biometricAvailable()))
    throw new Error("อุปกรณ์ยังไม่ได้ตั้งค่า Face ID / ลายนิ้วมือ");
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "เปิดใช้การเข้าสู่ระบบอย่างรวดเร็ว",
    disableDeviceFallback: true,
    biometricsSecurityLevel: "strong",
  });
  if (!result.success) throw new Error("ยกเลิกการยืนยันตัวตน");
  await SecureStore.setItemAsync(KEY, session.refreshToken, {
    requireAuthentication: true,
  });
}
export async function biometricSession(): Promise<AuthSession> {
  const token = await SecureStore.getItemAsync(KEY, {
    requireAuthentication: true,
    authenticationPrompt: "เข้าสู่ระบบ Meddy",
  });
  if (!token)
    throw new Error("กรุณาเข้าสู่ระบบด้วยรหัสผ่านและเปิด biometrics ก่อน");
  const session = await refreshSession(token);
  if (session.refreshToken)
    await SecureStore.setItemAsync(KEY, session.refreshToken, {
      requireAuthentication: true,
    });
  return session;
}
export async function clearBiometrics() {
  await SecureStore.deleteItemAsync(KEY);
}
