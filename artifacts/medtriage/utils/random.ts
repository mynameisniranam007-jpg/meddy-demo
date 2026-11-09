export function randomBytes(length: number): Uint8Array {
  if (!globalThis.crypto?.getRandomValues)
    throw new Error(
      "อุปกรณ์นี้ไม่รองรับการสุ่มรหัส กรุณาใช้ HTTPS หรือเชื่อม Auth API",
    );
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}
