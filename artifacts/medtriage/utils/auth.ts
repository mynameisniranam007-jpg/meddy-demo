// Persist only salted password verifiers for this local prototype; OTP challenges stay in memory.
import {
  checkDemoPassword,
  passwordVerifier,
  readDemoAccounts,
  updateDemoAccounts,
} from "./demoAccounts";
import { randomBytes } from "./random";
// Configure an HTTPS auth service using the contract in AUTH_FLOW.md for real use.
export type AuthSession = {
  userId: string;
  identifier: string;
  displayName: string;
  refreshToken?: string;
  accessToken?: string;
};
const api = process.env.EXPO_PUBLIC_AUTH_API_URL?.replace(/\/$/, "");
export const isDemoAuth = !api;

let challenge: {
  id: string;
  identifier: string;
  code: string;
  expires: number;
  tries: number;
  sent: number;
  verified: boolean;
} | null = null;
export function cleanText(value: string, limit = 200) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, limit);
}
export function normalizeIdentifier(value: string) {
  const input = cleanText(value, 254);
  if (input.includes("@")) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input))
      throw new Error("กรอกอีเมลให้ถูกต้อง");
    return input.toLowerCase();
  }
  const phone = input.replace(/[\s()-]/g, "");
  if (!/^0\d{9}$/.test(phone) && !/^\+66\d{9}$/.test(phone))
    throw new Error("กรอกเบอร์โทร 10 หลัก หรืออีเมล");
  return phone.startsWith("0") ? "+66" + phone.slice(1) : phone;
}
export function validatePassword(value: string) {
  if (value.length < 8 || value.length > 128 || !/\S/.test(value))
    throw new Error("ใช้รหัสผ่าน 8–128 ตัวอักษร");
}
async function call<T>(path: string, body: object): Promise<T> {
  if (!api?.startsWith("https://"))
    throw new Error("ต้องตั้งค่า HTTPS Auth API ก่อนใช้งานจริง");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(api + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(
        response.status === 429
          ? "ทำรายการบ่อยเกินไป กรุณารอแล้วลองใหม่"
          : "ทำรายการไม่ได้ กรุณาตรวจข้อมูลและลองใหม่",
      );
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      throw new Error("การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้ง");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
export async function registerAccount(
  identifier: string,
  password: string,
  displayName: string,
) {
  identifier = normalizeIdentifier(identifier);
  validatePassword(password);
  displayName = cleanText(displayName, 100);
  if (!displayName) throw new Error("กรอกชื่อที่ใช้แสดง");
  if (!isDemoAuth)
    return call<AuthSession>("/register", {
      identifier,
      password,
      displayName,
    });
  const randomId = Array.from(randomBytes(16), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const session: AuthSession = {
    userId: "demo-" + randomId,
    identifier,
    displayName,
  };
  const verifier = await passwordVerifier(password);
  await updateDemoAccounts(async (accounts) => {
    if (accounts.some((account) => account.session.identifier === identifier))
      throw new Error("มีบัญชีนี้ในอุปกรณ์แล้ว กรุณาเข้าสู่ระบบ");
    return [...accounts, { session, verifier }];
  });
  return session;
}
export async function signIn(identifier: string, password: string) {
  identifier = normalizeIdentifier(identifier);
  if (!isDemoAuth) return call<AuthSession>("/login", { identifier, password });
  const account = (await readDemoAccounts()).find(
    (a) => a.session.identifier === identifier,
  );
  if (!account || !(await checkDemoPassword(account, password)))
    throw new Error("อีเมล/เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง");
  return account.session;
}
export async function requestOtp(
  identifier: string,
): Promise<{ challengeId: string; demoOtp?: string }> {
  identifier = normalizeIdentifier(identifier);
  if (!isDemoAuth) return call("/password/request", { identifier });
  if (challenge && Date.now() - challenge.sent < 30000)
    throw new Error("รอ 30 วินาทีก่อนขอรหัสใหม่");
  const bytes = randomBytes(4);
  const number =
    (bytes[0] * 0x1000000 + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3]) >>>
    0;
  const code = String(number % 1000000).padStart(6, "0");
  challenge = {
    id: "demo-" + Date.now(),
    identifier,
    code,
    expires: Date.now() + 300000,
    tries: 0,
    sent: Date.now(),
    verified: false,
  };
  return { challengeId: challenge.id, demoOtp: code };
}
export async function verifyOtp(
  challengeId: string,
  otp: string,
): Promise<{ resetToken: string }> {
  if (!/^\d{6}$/.test(otp)) throw new Error("กรอกรหัส OTP ให้ครบ 6 หลัก");
  if (!isDemoAuth) return call("/password/verify", { challengeId, otp });
  if (
    !challenge ||
    challenge.id !== challengeId ||
    challenge.expires < Date.now() ||
    challenge.tries >= 5 ||
    challenge.verified
  )
    throw new Error("รหัสหมดอายุหรือใช้ไม่ได้ กรุณาขอรหัสใหม่");
  challenge.tries++;
  if (challenge.code !== otp) throw new Error("OTP ไม่ถูกต้อง");
  challenge.verified = true;
  return { resetToken: challenge.id };
}
export async function resetPassword(resetToken: string, password: string) {
  validatePassword(password);
  if (!isDemoAuth)
    return call<void>("/password/reset", { resetToken, password });
  if (
    !challenge ||
    !challenge.verified ||
    challenge.id !== resetToken ||
    challenge.expires < Date.now()
  )
    throw new Error("หมดเวลาตั้งรหัสผ่าน กรุณาขอ OTP ใหม่");
  const recovery = challenge;
  const verifier = await passwordVerifier(password);
  await updateDemoAccounts(async (accounts) => {
    if (challenge !== recovery || recovery.expires < Date.now())
      throw new Error("หมดเวลาตั้งรหัสผ่าน กรุณาขอ OTP ใหม่");
    const account = accounts.find(
      (a) => a.session.identifier === recovery.identifier,
    );
    if (!account)
      throw new Error(
        "ไม่มีบัญชีทดลองในอุปกรณ์นี้ กรุณาสมัครด้วยข้อมูลสมมติก่อน",
      );
    return accounts.map((a) => (a === account ? { ...a, verifier } : a));
  });
  challenge = null;
}
export async function revokeSession(session: AuthSession) {
  if (!isDemoAuth)
    await call("/logout", { refreshToken: session.refreshToken });
}
export async function refreshSession(refreshToken: string) {
  return call<AuthSession>("/session/refresh", { refreshToken });
}
export function cancelRecovery() {
  challenge = null;
}
