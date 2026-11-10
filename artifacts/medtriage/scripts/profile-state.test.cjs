const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { sourceLoader, memoryStorage } = require("./load-source.cjs");
const root = path.join(__dirname, "..");
const load = sourceLoader(memoryStorage());
const profiles = load(path.join(root, "constants/profile.ts"));
const state = load(path.join(root, "utils/appState.ts"));

test("legacy names migrate without duplicating title or surname; explicit edits round trip", () => {
  for (const input of [
    { fullName: "นายสมชาย ใจดี" },
    { fullName: "นายสมชาย ใจดี", firstName: "สมชาย ใจดี" },
    { title: "นาย", firstName: "สมชาย ใจดี", lastName: "ใจดี" },
  ]) {
    const normalized = profiles.normalizePatientProfile(input);
    assert.equal(normalized.firstName, "สมชาย");
    assert.equal(normalized.lastName, "ใจดี");
    assert.equal(normalized.fullName, "นายสมชาย ใจดี");
    assert.deepEqual(profiles.normalizePatientProfile(normalized), normalized);
  }
  const edited = {
    ...profiles.emptyPatientProfile,
    title: "นาย",
    firstName: "สมชาย",
    lastName: "",
  };
  edited.fullName = profiles.formatPatientName(edited);
  assert.equal(profiles.normalizePatientProfile(edited).lastName, "");
  assert.equal(
    profiles.normalizePatientProfile({
      firstName: null,
      lastName: 7,
      fullName: null,
    }).firstName,
    "",
  );
  assert.deepEqual(profiles.splitPatientName("  นางสาว มาลี   แซ่ ลี้  "), {
    title: "นางสาว",
    firstName: "มาลี",
    lastName: "แซ่ ลี้",
  });
});

const caregiver = {
  userId: "owner",
  identifier: "0000000000000",
  displayName: "ผู้ดูแล",
};
function patient(id, name) {
  return {
    id,
    relationship: "บิดา",
    profile: profiles.normalizePatientProfile({
      fullName: name,
      phone: "0801112222",
      conditions: "ไม่ทราบ",
      drugAllergies: "ไม่ทราบ",
    }),
  };
}
const triage = {
  id: "triage-1",
  createdAt: new Date().toISOString(),
  symptoms: "เจ็บคอ 2 วัน",
  bodyParts: ["คอ"],
  photoUri: null,
  assessment: {
    area: "คอ",
    name: "ตัวอย่างคออักเสบ",
    detail: "ข้อมูลทดสอบ",
    level: 2,
  },
};
test("guest assessment, auth continuation and active family survive serialization", () => {
  const before = {
    ...state.emptyAppState(),
    ownerId: "owner",
    session: caregiver,
    familyMembers: [
      patient("father", "สมชาย ใจดี"),
      patient("mother", "มาลี ใจดี"),
    ],
    activePatientId: "mother",
    symptoms: triage.symptoms,
    bodyParts: triage.bodyParts,
    pendingTriageSession: triage,
    pendingDestination: {
      pathname: "/booking",
      params: { hospitalId: "thammasat", mode: "advance" },
    },
    bookingDraft: {
      hospitalId: "thammasat",
      day: 2,
      time: "14:00–14:30",
      doctor: 1,
    },
  };
  const restored = state.restoreAppState(
    state.serializeAppState(before, true),
    true,
  );
  assert.equal(restored.activePatientId, "mother");
  assert.equal(restored.familyMembers[1].profile.firstName, "มาลี");
  assert.deepEqual(restored.pendingTriageSession, triage);
  assert.deepEqual(restored.bookingDraft, before.bookingDraft);
  assert.deepEqual(restored.pendingDestination, before.pendingDestination);
  assert.equal(
    state.restoreAppState(state.serializeAppState(before, false), false)
      .session,
    null,
  );
  const malformed = state.restoreAppState(
    JSON.stringify({
      version: 2,
      familyMembers: [null, { id: "x", profile: null }],
      location: { latitude: "bad" },
      pendingDestination: "https://evil.example",
      bookingDraft: { day: 999 },
      cancellations: null,
    }),
    true,
  );
  assert.equal(malformed.pendingDestination, null);
  assert.equal(malformed.bookingDraft, null);
  assert.equal(malformed.location, null);
  assert.equal(malformed.familyMembers[0].profile.firstName, "");
  assert.throws(() => state.restoreAppState("null", true));
  const legacy = state.restoreAppState(
    JSON.stringify({
      ...state.emptyAppState(),
      ownerId: "old",
      session: {
        userId: "old",
        identifier: "old@example.com",
        displayName: "บัญชีเก่า",
      },
    }),
    true,
  );
  assert.equal(legacy.session, null);
  const guest = {
    ...state.emptyAppState(),
    pendingTriageSession: triage,
    bookingDraft: before.bookingDraft,
    pendingDestination: before.pendingDestination,
  };
  const signedIn = state.authenticatedState(guest, caregiver);
  assert.equal(signedIn.familyMembers[0].profile.nationalId, "0000000000000");
  assert.equal(signedIn.familyMembers[0].profile.phone, "");
  assert.deepEqual(signedIn.pendingTriageSession, triage);
  assert.deepEqual(signedIn.bookingDraft, guest.bookingDraft);
  const withSelf = {
    ...restored,
    familyMembers: [
      patient("owner", "ผู้ดูแล ตัวอย่าง"),
      ...restored.familyMembers,
    ],
  };
  assert.equal(
    state.authenticatedState(withSelf, caregiver).activePatientId,
    "mother",
  );
  const other = state.authenticatedState(withSelf, {
    userId: "another",
    identifier: "2222222222222",
    displayName: "บัญชี อื่น",
  });
  assert.equal(other.pendingTriageSession, null);
  assert.equal(other.familyMembers.length, 1);
  assert.equal(other.activePatientId, "another");
});

test("booking and consultation bind the selected sub-profile, with non-null medical fields", () => {
  const base = {
    reference: "demo",
    hospitalId: "thammasat",
    hospitalName: "ตัวอย่าง",
    department: "ทั่วไป",
    doctor: "ตัวอย่าง",
    dateISO: new Date().toISOString(),
    dateLabel: "วันนี้",
    timeSlot: "14:00",
    kind: "advance",
  };
  const father = patient("father", "สมชาย ใจดี");
  const mother = patient("mother", "มาลี ใจดี");
  assert.equal(
    state.bindAppointment(base, caregiver, father, triage).patientId,
    "father",
  );
  const appointment = state.bindAppointment(base, caregiver, mother, triage);
  assert.equal(appointment.patientName, "มาลี ใจดี");
  assert.equal(appointment.caregiverId, "owner");
  assert.deepEqual(appointment.triageSession, triage);
  const restored = state.restoreAppState(
    state.serializeAppState(
      {
        ...state.emptyAppState(),
        ownerId: "owner",
        session: caregiver,
        appointment,
      },
      true,
    ),
    true,
  );
  assert.deepEqual(restored.appointment.triageSession, triage);
  const payload = state.buildConsultationPayload(
    "resident",
    caregiver,
    mother,
    triage,
  );
  assert.equal(payload.patientId, "mother");
  assert.equal(payload.drugAllergies, "ไม่ทราบ");
  assert.equal(payload.conditions, "ไม่ทราบ");
  assert.equal(payload.symptoms, triage.symptoms);
  assert.throws(() =>
    state.buildConsultationPayload(
      "general",
      caregiver,
      { ...mother, profile: { ...mother.profile, drugAllergies: "" } },
      triage,
    ),
  );
  assert.throws(() => state.bindAppointment(base, null, father, triage));
});
