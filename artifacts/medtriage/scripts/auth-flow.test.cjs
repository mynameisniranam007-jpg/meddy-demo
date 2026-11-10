const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { sourceLoader, memoryStorage } = require("./load-source.cjs");
const root = path.join(__dirname, "..");

test("password recovery updates durable local verifier, surviving a new service instance", async () => {
  delete process.env.EXPO_PUBLIC_AUTH_API_URL;
  const storage = memoryStorage();
  const auth = sourceLoader(storage)(path.join(root, "utils/auth.ts"));
  assert.equal(
    auth.normalizeIdentifier(" 0-0000-00000-00-0 "),
    "0000000000000",
  );
  assert.throws(() => auth.normalizeIdentifier("080-111-2222"));
  assert.throws(() => auth.normalizeIdentifier("demo@example.com"));
  assert.throws(() => auth.normalizeIdentifier("A0000000000000"));
  assert.throws(() => auth.normalizeIdentifier("123"));
  assert.throws(() => auth.validatePassword("short"));
  const registered = await auth.registerAccount(
    "0000000000000",
    "original-pass",
    "สมชาย",
    "ใจดี",
  );
  await assert.rejects(
    auth.registerAccount("0000000000000", "original-pass", "ซ้ำ", "ตัวอย่าง"),
  );
  await assert.rejects(
    auth.registerAccount("2222222222222", "original-pass", "สมชาย", ""),
    /นามสกุล/,
  );
  assert.equal(registered.firstName, "สมชาย");
  assert.equal(registered.lastName, "ใจดี");
  const afterRefresh = sourceLoader(storage)(path.join(root, "utils/auth.ts"));
  assert.equal(
    (await afterRefresh.signIn("0-0000-00000-00-0", "original-pass")).userId,
    registered.userId,
  );
  const reloadedSession = await afterRefresh.signIn(
    "0000000000000",
    "original-pass",
  );
  assert.equal(reloadedSession.firstName, "สมชาย");
  assert.equal(reloadedSession.lastName, "ใจดี");
  let now = Date.now();
  const originalNow = Date.now;
  Date.now = () => now;
  try {
    let challenge = await auth.requestOtp("0000000000000");
    await assert.rejects(auth.requestOtp("0000000000000"), /30/);
    await assert.rejects(auth.verifyOtp(challenge.challengeId, "1"), /6/);
    const wrong = challenge.demoOtp === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++)
      await assert.rejects(auth.verifyOtp(challenge.challengeId, wrong));
    await assert.rejects(
      auth.verifyOtp(challenge.challengeId, challenge.demoOtp),
    );
    now += 31000;
    challenge = await auth.requestOtp("0000000000000");
    now += 300001;
    await assert.rejects(
      auth.verifyOtp(challenge.challengeId, challenge.demoOtp),
    );
    challenge = await auth.requestOtp("0000000000000");
    const { resetToken } = await auth.verifyOtp(
      challenge.challengeId,
      challenge.demoOtp,
    );
    await auth.resetPassword(resetToken, "replacement-pass");
    await assert.rejects(auth.resetPassword(resetToken, "another-pass"));
    const afterSecondRefresh = sourceLoader(storage)(
      path.join(root, "utils/auth.ts"),
    );
    await assert.rejects(
      afterSecondRefresh.signIn("0000000000000", "original-pass"),
    );
    assert.equal(
      (await afterSecondRefresh.signIn("0000000000000", "replacement-pass"))
        .userId,
      registered.userId,
    );
    const raw = [...storage.values.values()].join("");
    assert.ok(
      !raw.includes("original-pass") && !raw.includes("replacement-pass"),
    );
    assert.ok(raw.includes('"iterations":100000'));
    now += 31000;
    challenge = await auth.requestOtp("1111111111111");
    const unknown = await auth.verifyOtp(
      challenge.challengeId,
      challenge.demoOtp,
    );
    await assert.rejects(
      auth.resetPassword(unknown.resetToken, "replacement-pass"),
    );
    auth.cancelRecovery();
  } finally {
    Date.now = originalNow;
  }
});

test("corrupt local account data produces a handled error instead of TypeError", async () => {
  const storage = memoryStorage();
  storage.values.set("medtriage:demo-accounts:v1", "null");
  const auth = sourceLoader(storage)(path.join(root, "utils/auth.ts"));
  await assert.rejects(
    auth.signIn("0000000000000", "password-1"),
    (error) => !(error instanceof TypeError),
  );
});
