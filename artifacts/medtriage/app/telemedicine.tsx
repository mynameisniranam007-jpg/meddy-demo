import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import DoctorCard, { consultationDoctors } from "@/components/DoctorCard";
import VideoCallModal from "@/components/VideoCallModal";
import {
  BodyText,
  Eyebrow,
  IconButton,
  PrimaryButton,
  SecondaryButton,
  Screen,
  SurfaceCard,
} from "@/components/UI";
import { useColors } from "@/hooks/useColors";
import { useMedtriage } from "@/context/MedtriageContext";
import FamilyProfiles from "@/components/FamilyProfiles";
import { AuthField } from "@/components/AuthField";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import {
  buildConsultationPayload,
  type ConsultationPayload,
} from "@/utils/appState";
import { cleanText } from "@/utils/auth";

export default function TelemedicineScreen() {
  const colors = useColors();
  const {
    session,
    activePatient,
    pendingTriageSession,
    requestAuth,
    requestProfile,
    savePatientProfile,
  } = useMedtriage();
  const [call, setCall] = useState<ConsultationPayload | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    consultationDoctors[0].id,
  );
  const [providerFilter, setProviderFilter] = useState<"general" | "resident">(
    "general",
  );
  const [requestedType, setRequestedType] = useState<"general" | "resident">(
    "general",
  );
  const [healthOpen, setHealthOpen] = useState(false);
  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setCall(null);
    setHealthOpen(false);
    setError("");
  }, [activePatient?.id]);
  const chooseProvider = (doctor: (typeof consultationDoctors)[number]) => {
    const type = doctor.provider;
    setSelectedDoctorId(doctor.id);
    setError("");
    setRequestedType(type);
    if (!session) {
      requestAuth("/telemedicine");
      return;
    }
    if (!activePatient?.profile.phone) {
      requestProfile("/telemedicine");
      return;
    }
    if (
      !activePatient.profile.conditions.trim() ||
      !activePatient.profile.drugAllergies.trim()
    ) {
      setConditions(activePatient.profile.conditions);
      setAllergies(activePatient.profile.drugAllergies);
      setHealthOpen(true);
      return;
    }
    try {
      setCall(
        buildConsultationPayload(
          type,
          session,
          activePatient,
          pendingTriageSession,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "เตรียมข้อมูลปรึกษาไม่ได้");
    }
  };
  const confirmHealth = async () => {
    if (saving || !activePatient || !session) return;
    setError("");
    if (!cleanText(conditions, 2000) || !cleanText(allergies, 2000)) {
      setError("ระบุโรคประจำตัวและประวัติแพ้ยา หากยังไม่ทราบให้กรอก “ไม่ทราบ”");
      return;
    }
    setSaving(true);
    try {
      const patient = {
        ...activePatient,
        profile: {
          ...activePatient.profile,
          conditions: cleanText(conditions, 2000),
          drugAllergies: cleanText(allergies, 2000),
        },
      };
      const payload = buildConsultationPayload(
        requestedType,
        session,
        patient,
        pendingTriageSession,
      );
      await savePatientProfile(patient.profile);
      setCall(payload);
      setHealthOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกข้อมูลไม่ได้");
    } finally {
      setSaving(false);
    }
  };
  const visibleCall =
    call && call.patientId === activePatient?.id ? call : null;
  const selectedDoctor =
    consultationDoctors.find((doctor) => doctor.id === selectedDoctorId) ??
    consultationDoctors[0];
  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          label="ย้อนกลับ"
          onPress={() => router.back()}
        />
        <View style={styles.headerCopy}>
          <Eyebrow>Telemedicine</Eyebrow>
          <Text style={[styles.title, { color: colors.foreground }]}>
            ปรึกษาแพทย์
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
      <FamilyProfiles />
      <SurfaceCard style={styles.infoCard}>
        <Text style={[styles.infoTitle, { color: colors.foreground }]}>
          ผู้ป่วย:{" "}
          {activePatient?.profile.fullName || "เลือกผู้ป่วยหลังเข้าสู่ระบบ"}
        </Text>
        <BodyText>
          แตะการ์ดแพทย์เพื่อดูประวัติ แล้วเลือกปรึกษาแพทย์ที่ต้องการ
        </BodyText>
        <View style={styles.filters}>
          {(["general", "resident"] as const).map((type) => (
            <Pressable
              key={type}
              accessibilityRole="button"
              accessibilityState={{ selected: providerFilter === type }}
              onPress={() => setProviderFilter(type)}
              style={[
                styles.filter,
                {
                  backgroundColor:
                    providerFilter === type
                      ? colors.primary
                      : colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    providerFilter === type
                      ? colors.primaryForeground
                      : colors.foreground,
                  fontSize: 16,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {type === "general" ? "แพทย์ทั่วไป" : "แพทย์ประจำบ้าน"}
              </Text>
            </Pressable>
          ))}
        </View>
        <BodyText>
          {providerFilter === "general"
            ? "ผู้ใช้จำนวนมาก อาจต้องรอ · สถานะคิวจำลอง"
            : "คิวแพทย์ประจำบ้าน · สถานะจำลอง"}
        </BodyText>
      </SurfaceCard>
      {consultationDoctors
        .filter((doctor) => doctor.provider === providerFilter)
        .map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onConsult={() => chooseProvider(doctor)}
          />
        ))}
      {error && !healthOpen ? (
        <Text accessibilityRole="alert" style={{ color: colors.destructive }}>
          {error}
        </Text>
      ) : null}
      {visibleCall ? (
        <VideoCallModal
          key={`${selectedDoctor.id}-${visibleCall.patientId}`}
          doctor={selectedDoctor}
          patientName={visibleCall.patientName}
          onEnd={() => setCall(null)}
        />
      ) : null}
      <PrimaryButton
        title="กลับไปหน้าหลัก"
        icon="home"
        onPress={() => router.replace("/(tabs)")}
      />
      <Modal
        visible={healthOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!saving) setHealthOpen(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: "85%",
              width: "100%",
              maxWidth: 520,
              alignSelf: "center",
              borderRadius: 22,
              backgroundColor: colors.card,
              overflow: "hidden",
            }}
          >
            <KeyboardAwareScrollViewCompat
              contentContainerStyle={{ padding: 20, gap: 18 }}
            >
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 21,
                  fontWeight: "800",
                }}
              >
                เพิ่มประวัติสั้น ๆ ก่อนปรึกษา
              </Text>
              <BodyText>ผู้ป่วย: {activePatient?.profile.fullName}</BodyText>
              <BodyText>
                หากไม่แน่ใจ ให้ระบุ “ไม่ทราบ” ไม่ต้องคาดเดาว่าไม่มีประวัติ
              </BodyText>
              <AuthField
                label="โรคประจำตัว"
                value={conditions}
                onChangeText={setConditions}
                maxLength={2000}
              />
              <AuthField
                label="ประวัติแพ้ยา"
                value={allergies}
                onChangeText={setAllergies}
                maxLength={2000}
              />
              {error ? (
                <Text
                  accessibilityRole="alert"
                  style={{ color: colors.destructive }}
                >
                  {error}
                </Text>
              ) : null}
              <PrimaryButton
                title="บันทึกและเข้าสู่หน้าปรึกษา"
                onPress={() => void confirmHealth()}
                loading={saving}
              />
              <SecondaryButton
                title="กลับไปก่อน"
                onPress={() => setHealthOpen(false)}
                disabled={saving}
              />
            </KeyboardAwareScrollViewCompat>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 19 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  filter: {
    flexGrow: 1,
    flexBasis: 130,
    minHeight: 54,
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: { alignItems: "center", gap: 4 },
  title: { fontSize: 18, fontWeight: "800" },
  infoCard: { gap: 9 },
  infoTitle: { flex: 1, fontSize: 16, lineHeight: 25, fontWeight: "700" },
});
