export const PROFILE_STORAGE_KEY = "medtriage:patient-profile";

export type PatientProfile = {
  fullName: string;
  title: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
  bloodGroup: string;
  rhFactor: string;
  weightKg: string;
  heightCm: string;
  conditions: string;
  drugAllergies: string;
  foodAllergies: string;
  medications: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  coverage: string;
};

export const emptyPatientProfile: PatientProfile = {
  fullName: "",
  title: "",
  firstName: "",
  lastName: "",
  nationalId: "",
  birthDate: "",
  gender: "",
  phone: "",
  address: "",
  bloodGroup: "",
  rhFactor: "",
  weightKg: "",
  heightCm: "",
  conditions: "",
  drugAllergies: "",
  foodAllergies: "",
  medications: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  coverage: "",
};

export function formatPatientName(
  profile: Pick<PatientProfile, "title" | "firstName" | "lastName">,
) {
  return `${profile.title.trim()}${profile.firstName.trim()}${profile.lastName.trim() ? " " + profile.lastName.trim() : ""}`.trim();
}

export function splitPatientName(value: string) {
  let name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  const title =
    ["นางสาว", "เด็กหญิง", "เด็กชาย", "นาง", "นาย"].find((prefix) =>
      name.startsWith(prefix),
    ) ?? "";
  if (title) name = name.slice(title.length).trim();
  const [firstName = "", ...surname] = name.split(" ");
  return { title, firstName, lastName: surname.join(" ") };
}

/** Normalize legacy fullName-only records once, without collapsing structured names. */
export function normalizePatientProfile(value: unknown): PatientProfile {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const profile = { ...emptyPatientProfile };
  for (const key of Object.keys(profile) as (keyof PatientProfile)[]) {
    profile[key] =
      typeof record[key] === "string"
        ? (record[key] as string)
            .replace(/[\u0000-\u001f\u007f]/g, "")
            .trim()
            .slice(0, 2000)
        : "";
  }
  const legacy = splitPatientName(profile.fullName);
  let firstName = profile.firstName || legacy.firstName;
  let lastName = profile.lastName || legacy.lastName;
  const parsedFirst = splitPatientName(firstName);
  if (
    !profile.firstName ||
    !profile.lastName ||
    firstName.endsWith(" " + profile.lastName)
  ) {
    firstName = parsedFirst.firstName;
    lastName = profile.lastName || parsedFirst.lastName || legacy.lastName;
  } else if (parsedFirst.title) {
    firstName = firstName.slice(parsedFirst.title.length).trim();
  }
  const title = profile.title || parsedFirst.title || legacy.title;
  return {
    ...profile,
    title,
    firstName,
    lastName,
    fullName: `${title}${firstName}${lastName ? " " + lastName : ""}`.trim(),
  };
}

export const demoGuestProfile: PatientProfile = {
  ...emptyPatientProfile,
  fullName: "นายสมชาย ใจดี (ข้อมูลจำลอง)",
  title: "นาย",
  firstName: "สมชาย",
  lastName: "ใจดี",
  birthDate: "15/06/2535",
  gender: "ชาย",
  phone: "080-000-0000",
  address: "ข้อมูลที่อยู่สมมติ · กรุงเทพฯ",
  bloodGroup: "O",
  rhFactor: "ไม่ทราบ",
  weightKg: "68",
  heightCm: "170",
  conditions: "ไม่มี (ข้อมูลจำลอง)",
  drugAllergies: "ไม่มี (ข้อมูลจำลอง)",
  foodAllergies: "ไม่มี (ข้อมูลจำลอง)",
  medications: "ไม่มี (ข้อมูลจำลอง)",
  emergencyName: "นางสมหญิง ใจดี (ข้อมูลจำลอง)",
  emergencyRelation: "ญาติ (ข้อมูลจำลอง)",
  emergencyPhone: "081-000-0000",
  coverage: "บัตรทอง (ข้อมูลจำลอง)",
};

export function formatNationalId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  const groups = [
    digits.slice(0, 1),
    digits.slice(1, 5),
    digits.slice(5, 10),
    digits.slice(10, 12),
    digits.slice(12, 13),
  ];
  return groups.filter(Boolean).join("-");
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function maskNationalId(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 13) return "ยังไม่ระบุ";
  return `${digits[0]}-${digits[1]}xxx-xxxxx-xx-${digits[12]}`;
}

function parseBirthDate(value: string) {
  const input = value.trim();
  const dateParts = input.includes("/")
    ? input.split("/").map((part) => Number(part.trim()))
    : input
        .split("-")
        .reverse()
        .map((part) => Number(part.trim()));
  if (
    dateParts.length !== 3 ||
    dateParts.some((part) => !Number.isFinite(part))
  )
    return null;

  const [day, month, enteredYear] = dateParts;
  const year = enteredYear > 2400 ? enteredYear - 543 : enteredYear;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return date;
}

export function calculateAge(value: string) {
  const birthDate = parseBirthDate(value);
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

export function calculateBmi(weight: string, height: string) {
  const weightValue = Number(weight);
  const heightValue = Number(height) / 100;
  if (
    !Number.isFinite(weightValue) ||
    !Number.isFinite(heightValue) ||
    weightValue <= 0 ||
    heightValue <= 0
  )
    return null;
  return weightValue / (heightValue * heightValue);
}
