/** Format/length validation for the prototype, not government identity verification. */
export function isNationalId(value: unknown): value is string {
  return typeof value === "string" && /^\d{13}$/.test(value);
}
export function normalizeNationalId(value: string): string {
  const input = typeof value === "string" ? value.trim() : "";
  const digits = input.replace(/[\s-]/g, "");
  if (!/^[\d\s-]+$/.test(input) || !isNationalId(digits))
    throw new Error("กรอกเลขบัตรประชาชนให้ครบ 13 หลัก");
  return digits;
}
