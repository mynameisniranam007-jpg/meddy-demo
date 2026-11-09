const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

test("demo authentication, input normalization and recovery lifecycle", async () => {
  delete process.env.EXPO_PUBLIC_AUTH_API_URL;
  const source = fs.readFileSync(
    path.join(__dirname, "../utils/auth.ts"),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const auth = await import(
    "data:text/javascript;base64," + Buffer.from(js).toString("base64")
  );
  assert.equal(
    auth.normalizeIdentifier("  DEMO@example.com "),
    "demo@example.com",
  );
  assert.equal(auth.normalizeIdentifier("080-111-2222"), "+66801112222");
  assert.throws(() => auth.normalizeIdentifier("123"), /เบอร์โทร/);
  assert.throws(() => auth.validatePassword("short"), /8/);
  await auth.registerAccount(
    "demo@example.com",
    "demo-pass-1",
    "ผู้ดูแลตัวอย่าง",
  );
  assert.equal(
    (await auth.signIn("DEMO@example.com", "demo-pass-1")).displayName,
    "ผู้ดูแลตัวอย่าง",
  );
  await assert.rejects(auth.signIn("demo@example.com", "wrong"));
  let now = Date.now();
  const originalNow = Date.now;
  Date.now = () => now;
  try {
    let challenge = await auth.requestOtp("demo@example.com");
    await assert.rejects(auth.requestOtp("demo@example.com"), /30/);
    await assert.rejects(auth.verifyOtp(challenge.challengeId, "1"), /6/);
    const wrong = challenge.demoOtp === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++)
      await assert.rejects(auth.verifyOtp(challenge.challengeId, wrong));
    await assert.rejects(
      auth.verifyOtp(challenge.challengeId, challenge.demoOtp),
      /หมดอายุ/,
    );
    now += 31000;
    challenge = await auth.requestOtp("demo@example.com");
    now += 300001;
    await assert.rejects(
      auth.verifyOtp(challenge.challengeId, challenge.demoOtp),
      /หมดอายุ/,
    );
    challenge = await auth.requestOtp("demo@example.com");
    const { resetToken } = await auth.verifyOtp(
      challenge.challengeId,
      challenge.demoOtp,
    );
    await auth.resetPassword(resetToken, "demo-pass-2");
    await assert.rejects(
      auth.resetPassword(resetToken, "another-pass"),
      /หมดเวลา/,
    );
    await assert.rejects(auth.signIn("demo@example.com", "demo-pass-1"));
    assert.ok(await auth.signIn("demo@example.com", "demo-pass-2"));
    now += 31000;
    challenge = await auth.requestOtp("missing@example.com");
    const unknown = await auth.verifyOtp(
      challenge.challengeId,
      challenge.demoOtp,
    );
    await assert.rejects(
      auth.resetPassword(unknown.resetToken, "demo-pass-3"),
      /ไม่มีบัญชีทดลอง/,
    );
    auth.cancelRecovery();
  } finally {
    Date.now = originalNow;
  }
});
