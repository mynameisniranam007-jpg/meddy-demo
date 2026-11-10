import { isNationalId } from "./nationalId";
import type { Href } from "expo-router";
import type { Appointment } from "../constants/data";
import {
  normalizePatientProfile,
  type PatientProfile,
} from "../constants/profile";
import type { AuthSession } from "./auth";

export const APP_STATE_KEY = "medtriage:app-state:v2";
export type FamilyMember = {
  id: string;
  relationship: string;
  profile: PatientProfile;
};
export type Coordinates = { latitude: number; longitude: number };
export type BookingDraft = {
  hospitalId: string;
  day: number;
  time: string | null;
  doctor: number;
};
export type TriageAssessment = {
  area: string;
  name: string;
  detail: string;
  level: number;
};
export type PendingTriageSession = {
  id: string;
  createdAt: string;
  symptoms: string;
  bodyParts: string[];
  photoUri: string | null;
  assessment: TriageAssessment | null;
};
export type AppState = {
  version: 2;
  ownerId: string | null;
  session: AuthSession | null;
  familyMembers: FamilyMember[];
  activePatientId: string | null;
  pendingDestination: Href | null;
  bookingDraft: BookingDraft | null;
  symptoms: string;
  bodyParts: string[];
  photoUri: string | null;
  location: Coordinates | null;
  selectedHospitalId: string | null;
  appointment: Appointment | null;
  cancellations: { day: string; count: number };
  pendingTriageSession: PendingTriageSession | null;
};
export function emptyAppState(): AppState {
  return {
    version: 2,
    ownerId: null,
    session: null,
    familyMembers: [],
    activePatientId: null,
    pendingDestination: null,
    bookingDraft: null,
    symptoms: "",
    bodyParts: [],
    photoUri: null,
    location: null,
    selectedHospitalId: null,
    appointment: null,
    cancellations: { day: "", count: 0 },
    pendingTriageSession: null,
  };
}
export function authenticatedState(
  current: AppState,
  next: AuthSession,
): AppState {
  if (!next.userId || !isNationalId(next.identifier))
    throw new Error("ข้อมูลบัญชีจากระบบไม่ถูกต้อง");
  const sameOwner = current.ownerId === next.userId;
  const self: FamilyMember = {
    id: next.userId,
    relationship: "ตนเอง",
    profile: normalizePatientProfile({
      fullName: next.displayName,
      firstName: next.firstName ?? "",
      lastName: next.lastName ?? "",
      nationalId: isNationalId(next.identifier) ? next.identifier : "",
    }),
  };
  const members =
    sameOwner && current.familyMembers.some((p) => p.id === next.userId)
      ? current.familyMembers
      : [self];
  const preserveTriage = (!current.ownerId && !current.session) || sameOwner;
  return {
    ...current,
    session: next,
    ownerId: next.userId,
    familyMembers: members,
    activePatientId:
      sameOwner && members.some((m) => m.id === current.activePatientId)
        ? current.activePatientId
        : next.userId,
    appointment: sameOwner ? current.appointment : null,
    ...(!preserveTriage
      ? {
          symptoms: "",
          bodyParts: [],
          photoUri: null,
          pendingTriageSession: null,
          bookingDraft: null,
          pendingDestination: null,
        }
      : {}),
  };
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (v: unknown, max = 4000) =>
  typeof v === "string" ? v.slice(0, max) : "";
const nullableText = (v: unknown, max = 200) =>
  typeof v === "string" && v ? v.slice(0, max) : null;
const strings = (v: unknown) =>
  Array.isArray(v)
    ? v
        .filter((s): s is string => typeof s === "string")
        .slice(0, 20)
        .map((s) => s.slice(0, 100))
    : [];
const photo = (v: unknown) =>
  typeof v === "string" && v.length < 2000000 && !v.startsWith("blob:")
    ? v
    : null;
export function readAssessment(value: unknown): TriageAssessment | null {
  const v = record(value);
  return [1, 2, 3].includes(Number(v.level)) &&
    typeof v.name === "string" &&
    typeof v.detail === "string" &&
    typeof v.area === "string"
    ? {
        area: text(v.area, 100),
        name: text(v.name, 300),
        detail: text(v.detail),
        level: Number(v.level),
      }
    : null;
}
function readTriage(value: unknown): PendingTriageSession | null {
  const v = record(value);
  return typeof v.id === "string"
    ? {
        id: text(v.id, 200),
        createdAt: text(v.createdAt, 100),
        symptoms: text(v.symptoms),
        bodyParts: strings(v.bodyParts),
        photoUri: photo(v.photoUri),
        assessment: readAssessment(v.assessment),
      }
    : null;
}
function destination(value: unknown): Href | null {
  const allowed = ["/(tabs)", "/(tabs)/profile", "/booking", "/telemedicine"];
  if (typeof value === "string")
    return allowed.includes(value) ? (value as Href) : null;
  const v = record(value);
  if (typeof v.pathname !== "string" || !allowed.includes(v.pathname))
    return null;
  const params = Object.fromEntries(
    Object.entries(record(v.params))
      .filter(
        ([k, val]) =>
          ["hospitalId", "department", "mode"].includes(k) &&
          typeof val === "string",
      )
      .map(([k, val]) => [k, text(val, 200)]),
  );
  return { pathname: v.pathname, params } as Href;
}
export function restoreAppState(
  raw: string,
  allowDemoSession: boolean,
): AppState {
  const v = record(JSON.parse(raw));
  if (v.version !== 2) throw new Error("ข้อมูลเดโมเป็นเวอร์ชันที่ไม่รองรับ");
  const initial = emptyAppState();
  const s = record(v.session);
  const session =
    allowDemoSession &&
    typeof s.userId === "string" &&
    isNationalId(s.identifier) &&
    typeof s.displayName === "string"
      ? {
          userId: text(s.userId, 200),
          identifier: text(s.identifier, 254),
          displayName: text(s.displayName, 100),
          firstName: text(s.firstName, 100),
          lastName: text(s.lastName, 100),
        }
      : null;
  const seen = new Set<string>();
  const familyMembers = (Array.isArray(v.familyMembers) ? v.familyMembers : [])
    .slice(0, 8)
    .flatMap((value) => {
      const m = record(value);
      if (typeof m.id !== "string" || !m.id || seen.has(m.id)) return [];
      seen.add(m.id);
      return [
        {
          id: m.id,
          relationship: text(m.relationship, 100),
          profile: normalizePatientProfile(m.profile),
        },
      ];
    });
  const ownerId = nullableText(v.ownerId);
  const validOwner = !session || ownerId === session.userId;
  const triage = record(v.pendingTriageSession);
  const pendingTriageSession = readTriage(triage);
  const draft = record(v.bookingDraft);
  const bookingDraft =
    typeof draft.hospitalId === "string" &&
    Number.isInteger(draft.day) &&
    Number(draft.day) >= 0 &&
    Number(draft.day) < 14 &&
    Number.isInteger(draft.doctor) &&
    Number(draft.doctor) >= 0 &&
    Number(draft.doctor) < 5
      ? {
          hospitalId: text(draft.hospitalId, 100),
          day: Number(draft.day),
          doctor: Number(draft.doctor),
          time: nullableText(draft.time, 50),
        }
      : null;
  const location = record(v.location);
  const validLocation =
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude) &&
    Math.abs(location.latitude) <= 90 &&
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude) &&
    Math.abs(location.longitude) <= 180;
  const appointment = record(v.appointment);
  const validAppointment =
    [
      "reference",
      "hospitalId",
      "hospitalName",
      "department",
      "doctor",
      "dateISO",
      "dateLabel",
      "timeSlot",
    ].every((key) => typeof appointment[key] === "string") &&
    ["advance", "checkin"].includes(String(appointment.kind));
  const parsedAppointment = validAppointment
    ? (Object.fromEntries(
        Object.entries(appointment).filter(
          ([key, value]) =>
            [
              "reference",
              "hospitalId",
              "hospitalName",
              "department",
              "doctor",
              "dateISO",
              "dateLabel",
              "timeSlot",
              "kind",
              "patientId",
              "patientName",
              "caregiverId",
            ].includes(key) && typeof value === "string",
        ),
      ) as Appointment)
    : null;
  if (parsedAppointment) {
    parsedAppointment.triageSession = readTriage(appointment.triageSession);
    if (
      Number.isInteger(appointment.rating) &&
      Number(appointment.rating) >= 1 &&
      Number(appointment.rating) <= 5
    )
      parsedAppointment.rating = Number(appointment.rating);
  }
  const cancellations = record(v.cancellations);
  return {
    ...initial,
    ownerId,
    session: validOwner ? session : null,
    familyMembers: validOwner ? familyMembers : [],
    activePatientId:
      validOwner &&
      typeof v.activePatientId === "string" &&
      familyMembers.some((m) => m.id === v.activePatientId)
        ? v.activePatientId
        : (familyMembers[0]?.id ?? null),
    pendingDestination: destination(v.pendingDestination),
    bookingDraft,
    pendingTriageSession,
    symptoms: text(v.symptoms),
    bodyParts: strings(v.bodyParts),
    photoUri: photo(v.photoUri),
    selectedHospitalId: nullableText(v.selectedHospitalId),
    location: validLocation ? (location as Coordinates) : null,
    appointment: validOwner ? parsedAppointment : null,
    cancellations: {
      day: text(cancellations.day, 40),
      count:
        Number.isInteger(cancellations.count) &&
        Number(cancellations.count) >= 0 &&
        Number(cancellations.count) <= 2
          ? Number(cancellations.count)
          : 0,
    },
  };
}
export function serializeAppState(
  state: AppState,
  persistDemoSession: boolean,
) {
  return JSON.stringify({
    ...state,
    session:
      persistDemoSession && state.session
        ? {
            userId: state.session.userId,
            identifier: state.session.identifier,
            displayName: state.session.displayName,
            firstName: state.session.firstName,
            lastName: state.session.lastName,
          }
        : null,
    photoUri: photo(state.photoUri),
    pendingTriageSession: state.pendingTriageSession
      ? {
          ...state.pendingTriageSession,
          photoUri: photo(state.pendingTriageSession.photoUri),
        }
      : null,
  });
}
export function bindAppointment(
  value: Appointment,
  session: AuthSession | null,
  patient: FamilyMember | null,
  triage: PendingTriageSession | null,
): Appointment {
  if (!session || !patient)
    throw new Error("เข้าสู่ระบบและเลือกผู้ป่วยก่อนยืนยันนัดหมาย");
  if (
    !patient.profile.firstName ||
    !/^0\d{9}$/.test(patient.profile.phone.replace(/\D/g, ""))
  )
    throw new Error("กรอกชื่อและเบอร์โทรผู้ป่วยให้ครบก่อนจอง");
  return {
    ...value,
    patientId: patient.id,
    patientName: patient.profile.fullName,
    caregiverId: session.userId,
    triageSession: triage,
  };
}

export type ConsultationPayload = {
  provider: "general" | "resident";
  patientId: string;
  patientName: string;
  caregiverId: string;
  phone: string;
  conditions: string;
  drugAllergies: string;
  symptoms: string;
};
export function buildConsultationPayload(
  provider: ConsultationPayload["provider"],
  session: AuthSession | null,
  patient: FamilyMember | null,
  triage: PendingTriageSession | null,
): ConsultationPayload {
  if (!session || !patient) throw new Error("เข้าสู่ระบบและเลือกผู้ป่วยก่อน");
  const profile = normalizePatientProfile(patient.profile);
  if (!profile.phone || !profile.conditions || !profile.drugAllergies)
    throw new Error("กรอกเบอร์โทร โรคประจำตัว และประวัติแพ้ยาของผู้ป่วยก่อน");
  return {
    provider,
    patientId: patient.id,
    patientName: profile.fullName,
    caregiverId: session.userId,
    phone: profile.phone,
    conditions: profile.conditions,
    drugAllergies: profile.drugAllergies,
    symptoms: triage?.symptoms ?? "",
  };
}
