import * as Crypto from "expo-crypto";
export function randomBytes(length: number): Uint8Array {
  return Crypto.getRandomBytes(length);
}
