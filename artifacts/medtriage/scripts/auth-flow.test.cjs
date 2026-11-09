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
    auth.normalizeIdentifier(" DEMO@example.com "),
    "demo@example.com",
  );
  assert.equal(auth.normalizeIdentifier("080-111-2222"), "+66801112222");
  assert.throws(() => auth.normalizeIdentifier("123"));
  assert.throws(() => auth.validatePassword("short"));
  const registered = await auth.registerAccount(
    "demo@example.com",
    "original-pass",
    "สมชาย ใจดี",
  );
  await assert.rejects(
    auth.registerAccount("demo@example.com", "original-pass", "ซ้ำ"),
  );
  const afterRefresh = sourceLoader(storage)(path.join(root, "utils/auth.ts"));
  assert.equal(
    (await afterRefresh.signIn("DEMO@example.com", "original-pass")).userId,
    registered.userId,
  );
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
    );
    now += 31000;
    challenge = await auth.requestOtp("demo@example.com");
    now += 300001;
    await assert.rejects(
      auth.verifyOtp(challenge.challengeId, challenge.demoOtp),
    );
    challenge = await auth.requestOtp("demo@example.com");
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
      afterSecondRefresh.signIn("demo@example.com", "original-pass"),
    );
    assert.equal(
      (await afterSecondRefresh.signIn("demo@example.com", "replacement-pass"))
        .userId,
      registered.userId,
    );
    const raw = [...storage.values.values()].join("");
    assert.ok(
      !raw.includes("original-pass") && !raw.includes("replacement-pass"),
    );
    assert.ok(raw.includes('"iterations":100000'));
    now += 31000;
    challenge = await auth.requestOtp("missing@example.com");
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
    auth.signIn("demo@example.com", "password-1"),
    (error) => !(error instanceof TypeError),
  );
});
