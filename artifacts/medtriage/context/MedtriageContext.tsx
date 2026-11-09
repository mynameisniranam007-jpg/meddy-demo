import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, router } from "expo-router";
import { Appointment, Hospital } from "@/constants/data";
import { emptyPatientProfile, PatientProfile } from "@/constants/profile";
import { AuthSession, cleanText, revokeSession } from "@/utils/auth";
import { clearBiometrics } from "@/utils/biometrics";
export type FamilyMember = {
  id: string;
  relationship: string;
  profile: PatientProfile;
};
type Coordinates = { latitude: number; longitude: number };
type BookingDraft = {
  hospitalId: string;
  day: number;
  time: string | null;
  doctor: number;
};
function useAppState() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState<Href | null>(
    null,
  );
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [symptoms, setSymptomsRaw] = useState("");
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null,
  );
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [cancellations, setCancellations] = useState({ day: "", count: 0 });
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    AsyncStorage.multiRemove([
      "medtriage:patient-profile",
      "medtriage:demo-appointment",
      "medtriage:demo-cancellations",
    ]).catch(() =>
      setStorageError("ล้างข้อมูลเดโมรุ่นเก่าไม่สำเร็จ โปรดล้างข้อมูลเว็บไซต์"),
    );
  }, []);
  const activePatient =
    familyMembers.find((member) => member.id === activePatientId) ?? null;
  const authStatus = session ? ("logged-in" as const) : ("guest" as const);
  const setSymptoms = (value: string) =>
    setSymptomsRaw(
      value
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
        .slice(0, 4000),
    );
  const toggleBodyPart = (value: string) =>
    setBodyParts((parts) =>
      parts.includes(value)
        ? parts.filter((p) => p !== value)
        : [...parts, value],
    );
  const authenticate = (next: AuthSession) => {
    if (!next.userId || !next.identifier)
      throw new Error("ข้อมูลบัญชีจากระบบไม่ถูกต้อง");
    if (session && session.userId !== next.userId) setAppointment(null);
    setSession(next);
    setFamilyMembers((current) =>
      current.some((p) => p.id === next.userId)
        ? current
        : [
            {
              id: next.userId,
              relationship: "ตนเอง",
              profile: {
                ...emptyPatientProfile,
                firstName: next.displayName,
                fullName: next.displayName,
                phone: next.identifier.startsWith("+66")
                  ? "0" + next.identifier.slice(3)
                  : "",
              },
            },
          ],
    );
    setActivePatientId(next.userId);
  };
  const requestAuth = (destination: Href) => {
    setPendingDestination(destination);
    router.push("/login");
  };
  const requestProfile = (destination: Href) => {
    setPendingDestination(destination);
    router.push("/profile-setup");
  };
  const resumeAfterAuth = () => {
    const destination = pendingDestination ?? "/(tabs)";
    setPendingDestination(null);
    router.replace(destination);
  };
  const selectPatient = (id: string) => {
    if (familyMembers.some((p) => p.id === id)) setActivePatientId(id);
  };
  const addFamilyMember = (
    name: string,
    relationship: string,
    consent: boolean,
  ) => {
    if (!session) throw new Error("เข้าสู่ระบบก่อนเพิ่มสมาชิก");
    name = cleanText(name, 100);
    relationship = cleanText(relationship, 50);
    if (!name || !relationship || !consent)
      throw new Error("กรอกชื่อ ความสัมพันธ์ และยืนยันสิทธิ์ในการดูแล");
    if (familyMembers.length >= 8)
      throw new Error("เพิ่มสมาชิกได้ไม่เกิน 8 คนในเดโม");
    const member = {
      id: "family-" + Date.now(),
      relationship,
      profile: { ...emptyPatientProfile, firstName: name, fullName: name },
    };
    setFamilyMembers((current) => [...current, member]);
    setActivePatientId(member.id);
  };
  const savePatientProfile = async (profile: PatientProfile) => {
    if (!session || !activePatientId)
      throw new Error("เข้าสู่ระบบและเลือกผู้ป่วยก่อนบันทึก");
    setFamilyMembers((current) =>
      current.map((member) =>
        member.id === activePatientId ? { ...member, profile } : member,
      ),
    );
  };
  const saveAppointment = async (value: Appointment) => {
    if (!session || !activePatient)
      throw new Error("เข้าสู่ระบบก่อนยืนยันนัดหมาย");
    if (
      !activePatient.profile.fullName ||
      !/^0\d{9}$/.test(activePatient.profile.phone.replace(/\D/g, ""))
    )
      throw new Error("กรอกชื่อและเบอร์โทรผู้ป่วยให้ครบก่อนจอง");
    setAppointment({
      ...value,
      patientId: activePatient.id,
      patientName: activePatient.profile.fullName,
      caregiverId: session.userId,
    });
    setBookingDraft(null);
  };
  const updateAppointmentRating = async (rating: number) => {
    if (appointment) setAppointment({ ...appointment, rating });
  };
  const cancelAppointment = async () => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Bangkok",
    });
    const count = cancellations.day === today ? cancellations.count : 0;
    if (count >= 2) throw new Error("LIMIT");
    setCancellations({ day: today, count: count + 1 });
    setAppointment(null);
    return 1 - count;
  };
  const logout = async () => {
    if (session) await revokeSession(session);
    await clearBiometrics();
    setSession(null);
    setFamilyMembers([]);
    setActivePatientId(null);
    setPendingDestination(null);
    setBookingDraft(null);
    setSymptoms("");
    setBodyParts([]);
    setPhotoUri(null);
    setLocation(null);
    setSelectedHospital(null);
    setAppointment(null);
    setCancellations({ day: "", count: 0 });
  };
  return {
    session,
    authStatus,
    familyMembers,
    activePatient,
    activePatientId,
    authenticate,
    requestAuth,
    requestProfile,
    resumeAfterAuth,
    selectPatient,
    addFamilyMember,
    savePatientProfile,
    bookingDraft,
    setBookingDraft,
    storageError,
    symptoms,
    setSymptoms,
    bodyParts,
    toggleBodyPart,
    photoUri,
    setPhotoUri,
    location,
    setLocation,
    selectedHospital,
    setSelectedHospital,
    appointment,
    appointmentLoading: false,
    saveAppointment,
    updateAppointmentRating,
    cancelAppointment,
    logout,
  };
}
const MedtriageContext = createContext<ReturnType<typeof useAppState> | null>(
  null,
);
export function MedtriageProvider({ children }: { children: ReactNode }) {
  const value = useAppState();
  return (
    <MedtriageContext.Provider value={value}>
      {children}
    </MedtriageContext.Provider>
  );
}
export function useMedtriage() {
  const context = useContext(MedtriageContext);
  if (!context) throw new Error("MedtriageProvider is required");
  return context;
}
