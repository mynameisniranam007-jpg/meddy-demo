import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { Text } from "react-native";
import {
  Screen,
  SectionTitle,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  BodyText,
} from "@/components/UI";
import { AuthField } from "@/components/AuthField";
import FamilyProfiles from "@/components/FamilyProfiles";
import PatientProfileSection from "@/components/PatientProfileSection";
import { useMedtriage } from "@/context/MedtriageContext";
import { cleanText } from "@/utils/auth";
import {
  formatPatientName,
  normalizePatientProfile,
  formatPhone,
} from "@/constants/profile";
export default function ProfileSetupScreen() {
  const {
    session,
    activePatient,
    savePatientProfile,
    resumeAfterAuth,
    skipProfileSetup,
  } = useMedtriage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const profile = normalizePatientProfile(activePatient?.profile);
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(activePatient?.profile.phone ?? "");
    setError("");
    setExpanded(false);
  }, [
    activePatient?.id,
    activePatient?.profile.firstName,
    activePatient?.profile.lastName,
    activePatient?.profile.phone,
  ]);
  const save = async () => {
    if (busy || !activePatient) return;
    setBusy(true);
    setError("");
    try {
      if (!cleanText(firstName, 100) || !/^0\d{9}$/.test(phone))
        throw new Error("กรอกชื่อและเบอร์โทรผู้ป่วย 10 หลัก");
      await savePatientProfile({
        ...activePatient.profile,
        firstName: cleanText(firstName, 100),
        lastName: cleanText(lastName, 100),
        fullName: formatPatientName({
          ...activePatient.profile,
          firstName: cleanText(firstName, 100),
          lastName: cleanText(lastName, 100),
        }),
        phone,
      });
      resumeAfterAuth();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่ได้");
    } finally {
      setBusy(false);
    }
  };
  if (!session)
    return (
      <Screen>
        <SectionTitle title="ข้อมูลผู้ป่วย" />
        <BodyText>คัดกรองอาการได้ทันที เมื่อพร้อมจองค่อยเข้าสู่ระบบ</BodyText>
        <PrimaryButton
          title="เข้าสู่ระบบ"
          onPress={() => router.replace("/login")}
        />
        <SecondaryButton
          title="ไปคัดกรองอาการ"
          onPress={() => router.replace("/triage")}
        />
      </Screen>
    );
  return (
    <Screen contentStyle={{ gap: 18 }}>
      <SectionTitle
        title="เพิ่มข้อมูลทีละนิด"
        detail="ชื่อและเบอร์โทรใช้เตรียมนัดหมาย ประวัติสุขภาพเติมภายหลังได้"
      />
      <FamilyProfiles />
      <SurfaceCard style={{ gap: 18 }}>
        <AuthField
          label="ชื่อผู้ป่วย"
          value={firstName}
          onChangeText={setFirstName}
          maxLength={100}
        />
        <AuthField
          label="นามสกุลผู้ป่วย"
          value={lastName}
          onChangeText={setLastName}
          maxLength={100}
        />
        <AuthField
          label="เบอร์โทรผู้ป่วยหรือผู้ดูแล"
          value={formatPhone(phone)}
          onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
          numeric
          maxLength={12}
        />
        {error ? (
          <Text accessibilityRole="alert" style={{ color: "#B4232D" }}>
            {error}
          </Text>
        ) : null}
        <PrimaryButton
          title="บันทึกและดำเนินการต่อ"
          onPress={() => void save()}
          loading={busy}
        />
        <SecondaryButton
          title="ข้ามไปก่อน (Skip)"
          onPress={skipProfileSetup}
          disabled={busy}
        />
      </SurfaceCard>
      <SecondaryButton
        title={
          expanded
            ? "ซ่อนประวัติสุขภาพ"
            : "เพิ่มประวัติสุขภาพ / แพ้ยา (ทำภายหลังได้)"
        }
        onPress={() => setExpanded(!expanded)}
      />
      {expanded ? (
        <PatientProfileSection key={activePatient?.id} mode="profile" />
      ) : null}
    </Screen>
  );
}
