import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, router } from "expo-router";
import { Appointment, Hospital, hospitals } from "@/constants/data";
import {
  emptyPatientProfile,
  formatPatientName,
  normalizePatientProfile,
  PatientProfile,
} from "@/constants/profile";
import {
  AuthSession,
  cleanText,
  isDemoAuth,
  revokeSession,
} from "@/utils/auth";
import { clearBiometrics } from "@/utils/biometrics";
import {
  APP_STATE_KEY,
  AppState,
  authenticatedState,
  bindAppointment,
  BookingDraft,
  Coordinates,
  emptyAppState,
  FamilyMember,
  PendingTriageSession,
  restoreAppState,
  serializeAppState,
  TriageAssessment,
} from "@/utils/appState";
export type { FamilyMember, PendingTriageSession } from "@/utils/appState";

function newTriage(
  state: AppState,
  symptoms = state.symptoms,
): PendingTriageSession {
  return {
    id: "triage-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    symptoms,
    bodyParts: [...state.bodyParts],
    photoUri: state.photoUri,
    assessment: null,
  };
}
function useAppState() {
  const [state, setState] = useState<AppState>(emptyAppState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState("");
  const queue = useRef<Promise<void>>(Promise.resolve());
  const persistenceEnabled = useRef(true);
  const paused = useRef(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(APP_STATE_KEY)
      .then((raw) => {
        if (active && raw) setState(restoreAppState(raw, isDemoAuth));
      })
      .catch(() => {
        persistenceEnabled.current = false;
        if (active)
          setStorageError(
            "อ่านข้อมูลเดิมไม่ได้ ระบบยังใช้งานได้ แต่จะไม่เขียนทับข้อมูลเดิม โปรดล้างข้อมูลเดโมหากต้องการเริ่มใหม่",
          );
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!hydrated || paused.current || !persistenceEnabled.current) return;
    const serialized = serializeAppState(state, isDemoAuth);
    queue.current = queue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(APP_STATE_KEY, serialized))
      .catch(() =>
        setStorageError(
          "บันทึกข้อมูลในอุปกรณ์ไม่สำเร็จ ข้อมูลล่าสุดอาจไม่อยู่หลังรีโหลด",
        ),
      );
  }, [state, hydrated]);
  const session = state.session;
  const familyMembers =
    session && state.ownerId === session.userId ? state.familyMembers : [];
  const activePatient =
    familyMembers.find((member) => member.id === state.activePatientId) ?? null;
  const selectedHospital =
    hospitals.find((h) => h.id === state.selectedHospitalId) ?? null;
  const emergencyTransit =
    state.emergencyTransit &&
    hospitals.some((h) => h.id === state.emergencyTransit?.hospitalId)
      ? state.emergencyTransit
      : null;
  const patch = useCallback(
    (value: Partial<AppState>) =>
      setState((current) => ({ ...current, ...value })),
    [],
  );
  const setSymptoms = useCallback(
    (value: string) =>
      patch({
        symptoms: value
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
          .slice(0, 4000),
      }),
    [patch],
  );
  const toggleBodyPart = useCallback(
    (value: string) =>
      setState((current) => ({
        ...current,
        bodyParts: current.bodyParts.includes(value)
          ? current.bodyParts.filter((p) => p !== value)
          : [...current.bodyParts, value],
      })),
    [],
  );
  const setPhotoUri = useCallback(
    (value: string | null) => patch({ photoUri: value }),
    [patch],
  );
  const setLocation = useCallback(
    (value: Coordinates | null) => patch({ location: value }),
    [patch],
  );
  const setSelectedHospital = useCallback(
    (value: Hospital | null) =>
      patch({ selectedHospitalId: value?.id ?? null }),
    [patch],
  );
  const setBookingDraft = useCallback(
    (value: BookingDraft | null) => patch({ bookingDraft: value }),
    [patch],
  );
  const startEmergencyTransit = (hospital: Hospital) => {
    patch({
      selectedHospitalId: hospital.id,
      emergencyTransit: {
        hospitalId: hospital.id,
        startedAt: new Date().toISOString(),
      },
    });
  };
  const finishEmergencyTransit = () => patch({ emergencyTransit: null });
  const beginTriageSession = useCallback(
    (symptoms?: string) =>
      setState((current) => ({
        ...current,
        ...(!current.session
          ? {
              ownerId: null,
              familyMembers: [],
              activePatientId: null,
              appointment: null,
            }
          : {}),
        symptoms: symptoms ?? current.symptoms,
        pendingTriageSession: newTriage(current, symptoms ?? current.symptoms),
      })),
    [],
  );
  const recordTriageAssessment = useCallback(
    (assessment: TriageAssessment) =>
      setState((current) => ({
        ...current,
        pendingTriageSession: {
          ...(current.pendingTriageSession ?? newTriage(current)),
          assessment,
        },
      })),
    [],
  );
  const authenticate = useCallback((next: AuthSession) => {
    if (!next.userId || !next.identifier)
      throw new Error("ข้อมูลบัญชีจากระบบไม่ถูกต้อง");
    setState((current) => authenticatedState(current, next));
  }, []);
  const requestAuth = (destination: Href) => {
    setState((current) => ({
      ...current,
      pendingDestination: destination,
      pendingTriageSession: current.pendingTriageSession ?? newTriage(current),
    }));
    router.push("/login");
  };
  const requestProfile = (destination: Href) => {
    patch({ pendingDestination: destination });
    router.push("/profile-setup");
  };
  const resumeAfterAuth = () => {
    const destination = state.pendingDestination ?? "/(tabs)";
    patch({ pendingDestination: null });
    router.replace(destination);
  };
  const skipProfileSetup = () => router.replace("/(tabs)");
  const selectPatient = (id: string) => {
    if (familyMembers.some((p) => p.id === id)) patch({ activePatientId: id });
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
    const member: FamilyMember = {
      id: "family-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      relationship,
      profile: normalizePatientProfile({
        ...emptyPatientProfile,
        fullName: name,
      }),
    };
    setState((current) => ({
      ...current,
      familyMembers: [...current.familyMembers, member],
      activePatientId: member.id,
    }));
  };
  const savePatientProfile = async (profile: PatientProfile) => {
    if (!session || !activePatient)
      throw new Error("เข้าสู่ระบบและเลือกผู้ป่วยก่อนบันทึก");
    const id = activePatient.id;
    const normalized = normalizePatientProfile({
      ...profile,
      fullName: formatPatientName(profile),
    });
    setState((current) => ({
      ...current,
      familyMembers: current.familyMembers.map((member) =>
        member.id === id ? { ...member, profile: normalized } : member,
      ),
    }));
  };
  const saveAppointment = async (value: Appointment) => {
    const bound = bindAppointment(
      value,
      session,
      activePatient,
      state.pendingTriageSession,
    );
    patch({ appointment: bound, bookingDraft: null, pendingDestination: null });
  };
  const updateAppointmentRating = async (rating: number) => {
    if (state.appointment)
      patch({ appointment: { ...state.appointment, rating } });
  };
  const cancelAppointment = async () => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Bangkok",
    });
    const count =
      state.cancellations.day === today ? state.cancellations.count : 0;
    if (count >= 2) throw new Error("LIMIT");
    patch({
      cancellations: { day: today, count: count + 1 },
      appointment: null,
    });
    return 1 - count;
  };
  const logout = async () => {
    paused.current = true;
    setState(emptyAppState());
    router.dismissAll();
    router.replace("/");
    try {
      if (session) {
        void revokeSession(session).catch(() => undefined);
      }
      await clearBiometrics();
      await queue.current;
      await AsyncStorage.removeItem(APP_STATE_KEY);
      setStorageError("");
      persistenceEnabled.current = true;
    } finally {
      paused.current = false;
      setState((current) => ({ ...current }));
    }
  };
  return {
    emergencyTransit,
    startEmergencyTransit,
    finishEmergencyTransit,
    session,
    authStatus: session ? ("logged-in" as const) : ("guest" as const),
    familyMembers,
    activePatient,
    activePatientId: activePatient?.id ?? null,
    authenticate,
    requestAuth,
    requestProfile,
    resumeAfterAuth,
    skipProfileSetup,
    selectPatient,
    addFamilyMember,
    savePatientProfile,
    bookingDraft: state.bookingDraft,
    setBookingDraft,
    storageError,
    hydrated,
    pendingDestination: state.pendingDestination,
    pendingTriageSession: state.pendingTriageSession,
    beginTriageSession,
    recordTriageAssessment,
    symptoms: state.symptoms,
    setSymptoms,
    bodyParts: state.bodyParts,
    toggleBodyPart,
    photoUri: state.photoUri,
    setPhotoUri,
    location: state.location,
    setLocation,
    selectedHospital,
    setSelectedHospital,
    appointment: session ? state.appointment : null,
    appointmentLoading: !hydrated,
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
      {value.hydrated ? (
        children
      ) : (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>กำลังโหลดข้อมูลเดโม…</Text>
        </View>
      )}
    </MedtriageContext.Provider>
  );
}
export function useMedtriage() {
  const context = useContext(MedtriageContext);
  if (!context) throw new Error("Meddy provider is required");
  return context;
}

