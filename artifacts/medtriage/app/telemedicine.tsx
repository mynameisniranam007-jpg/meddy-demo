import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, View } from "react-native";
import {
  BodyText,
  Eyebrow,
  IconButton,
  Pill,
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
  const chooseProvider = (type: "general" | "resident") => {
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
        <BodyText>เลือกประเภทแพทย์ก่อนโทร · หน้าจอสาธิต</BodyText>
        <PrimaryButton
          title="แพทย์ทั่วไป · ผู้ใช้จำนวนมาก อาจต้องรอ"
          icon="users"
          onPress={() => chooseProvider("general")}
        />
        <PrimaryButton
          title="แพทย์ประจำบ้าน · คิวตัวอย่าง"
          icon="user"
          onPress={() => chooseProvider("resident")}
        />
      </SurfaceCard>
      {error && !healthOpen ? (
        <Text accessibilityRole="alert" style={{ color: colors.destructive }}>
          {error}
        </Text>
      ) : null}
      {visibleCall ? (
        <>
          <View style={[styles.callPanel, { backgroundColor: colors.primary }]}>
            <View style={styles.videoTile}>
              <View style={styles.doctorAvatar}>
                <Feather
                  name="user"
                  size={38}
                  color={colors.secondaryForeground}
                />
              </View>
              <Text style={styles.tileTitle}>
                {visibleCall.provider === "general"
                  ? "แพทย์ทั่วไปตัวอย่าง"
                  : "แพทย์ประจำบ้านตัวอย่าง"}
              </Text>
              <Text style={styles.tileSub}>
                ผู้ป่วย: {visibleCall.patientName}
              </Text>
              <Pill tone="teal">หน้าจอจำลอง</Pill>
            </View>
            <View style={styles.callControls}>
              <IconButton
                icon="phone-off"
                label="จบการปรึกษาตัวอย่าง"
                onPress={() => setCall(null)}
              />
            </View>
          </View>
          <SurfaceCard style={styles.infoCard}>
            <BodyText>
              ข้อมูลของผู้ป่วยที่เลือก: {visibleCall.patientName}
            </BodyText>
            <BodyText>โรคประจำตัว: {visibleCall.conditions}</BodyText>
            <BodyText>แพ้ยา: {visibleCall.drugAllergies}</BodyText>
            <BodyText>อาการ: {visibleCall.symptoms || "ยังไม่ระบุ"}</BodyText>
            <BodyText>ยังไม่มีการส่งข้อมูลหรือเชื่อมต่อแพทย์จริง</BodyText>
          </SurfaceCard>
        </>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: { alignItems: "center", gap: 4 },
  title: { fontSize: 18, fontWeight: "800" },
  callPanel: {
    minHeight: 360,
    borderRadius: 25,
    padding: 18,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  callOrb: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    right: -110,
    top: -90,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  videoTile: {
    flex: 1,
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#F2F7F7",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  doctorAvatar: {
    width: 83,
    height: 83,
    borderRadius: 30,
    backgroundColor: "#DDF3EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  tileTitle: { color: "#0D2C54", fontSize: 16, fontWeight: "800" },
  tileSub: { color: "#6E8295", fontSize: 12 },
  callControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingTop: 18,
  },
  controlCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
  },
  endCall: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#C94343",
  },
  infoCard: { gap: 9 },
  infoHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoTitle: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "800" },
  infoText: { fontSize: 12, lineHeight: 19 },
  footer: { textAlign: "center", fontSize: 11, lineHeight: 17 },
});
