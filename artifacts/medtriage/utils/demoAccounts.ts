import AsyncStorage from "@react-native-async-storage/async-storage";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { randomBytes } from "./random";
import type { AuthSession } from "./auth";

export const DEMO_ACCOUNTS_KEY = "medtriage:demo-accounts:v1";
type PasswordVerifier = { salt: string; hash: string; iterations: number };
export type DemoAccount = { session: AuthSession; verifier: PasswordVerifier };
function isDemoAccount(value: unknown): value is DemoAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Record<string, unknown>;
  const session =
    account.session && typeof account.session === "object"
      ? (account.session as Record<string, unknown>)
      : {};
  const verifier =
    account.verifier && typeof account.verifier === "object"
      ? (account.verifier as Record<string, unknown>)
      : {};
  return (
    typeof session.userId === "string" &&
    typeof session.identifier === "string" &&
    typeof session.displayName === "string" &&
    typeof verifier.salt === "string" &&
    /^[a-f0-9]{32}$/.test(verifier.salt) &&
    typeof verifier.hash === "string" &&
    /^[a-f0-9]{64}$/.test(verifier.hash) &&
    verifier.iterations === 100000
  );
}
let queue: Promise<unknown> = Promise.resolve();
export async function passwordVerifier(
  password: string,
  existing?: PasswordVerifier,
): Promise<PasswordVerifier> {
  const salt = existing?.salt ?? bytesToHex(randomBytes(16));
  const iterations = existing?.iterations ?? 100000;
  const hash = bytesToHex(
    await pbkdf2Async(sha256, password, hexToBytes(salt), {
      c: iterations,
      dkLen: 32,
    }),
  );
  return { salt, hash, iterations };
}
export async function readDemoAccounts(): Promise<DemoAccount[]> {
  const raw = await AsyncStorage.getItem(DEMO_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.accounts))
      throw new Error("VERSION");
    return data.accounts
      .filter(isDemoAccount)
      .map((a: DemoAccount) => ({
        session: {
          userId: a.session.userId,
          identifier: a.session.identifier,
          displayName: a.session.displayName,
        },
        verifier: a.verifier,
      }));
  } catch {
    throw new Error(
      "ข้อมูลบัญชีทดลองเสียหาย กรุณาล้างข้อมูลเว็บไซต์เพื่อเริ่มใหม่",
    );
  }
}
export function updateDemoAccounts(
  mutate: (accounts: DemoAccount[]) => Promise<DemoAccount[]>,
): Promise<void> {
  const task = queue
    .catch(() => undefined)
    .then(async () => {
      const accounts = await mutate(await readDemoAccounts());
      await AsyncStorage.setItem(
        DEMO_ACCOUNTS_KEY,
        JSON.stringify({ version: 1, accounts }),
      );
    });
  queue = task;
  return task;
}
export async function checkDemoPassword(
  account: DemoAccount,
  password: string,
) {
  const candidate = await passwordVerifier(password, account.verifier);
  let difference = 0;
  for (let i = 0; i < candidate.hash.length; i++)
    difference |=
      candidate.hash.charCodeAt(i) ^ account.verifier.hash.charCodeAt(i);
  return difference === 0;
}
