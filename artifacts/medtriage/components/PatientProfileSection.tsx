import React, { useEffect, useState } from "react";
import { useMedtriage } from "@/context/MedtriageContext";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BodyText, Pill, SurfaceCard } from "@/components/UI";
import PatientProfileEditor from "@/components/PatientProfileEditor";
import {
  calculateAge,
  calculateBmi,
  emptyPatientProfile,
  maskNationalId,
  PatientProfile,
  PROFILE_STORAGE_KEY,
} from "@/constants/profile";
import { useColors } from "@/hooks/useColors";

type Props = {
  mode: "setup" | "profile";
  initialNationalId?: string;
  onComplete?: () => void;
};

export default function PatientProfileSection({
  mode,
  initialNationalId,
  onComplete,
}: Props) {
  const colors = useColors();
  const { activePatient } = useMedtriage();
  const profile = activePatient?.profile ?? emptyPatientProfile;
  const [editing, setEditing] = useState(mode === "setup");
  const loading = false;
  const loadError = "";
  if (loading) {
    return (
      <SurfaceCard>
        <BodyText>กำลังโหลดประวัติส่วนตัว…</BodyText>
      </SurfaceCard>
    );
  }

  if (editing || mode === "setup" || !profile.fullName) {
    return (
      <View style={styles.section}>
        {loadError ? (
          <Text style={[styles.loadError, { color: colors.destructive }]}>
            {loadError}
          </Text>
        ) : null}
        <PatientProfileEditor
          initialProfile={profile}
          setup={mode === "setup"}
          onCancel={
            mode === "profile" && profile.fullName
              ? () => setEditing(false)
              : undefined
          }
          onSaved={(saved) => {
            setEditing(false);
            onComplete?.();
          }}
        />
      </View>
    );
  }

  const age = calculateAge(profile.birthDate);
  const bmi = calculateBmi(profile.weightKg, profile.heightCm);
  const bloodType = [profile.bloodGroup, profile.rhFactor]
    .filter(Boolean)
    .join(" ");

  return (
    <SurfaceCard style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIdentity}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Feather name="user" size={21} color={colors.accentForeground} />
          </View>
          <View style={styles.identityCopy}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {profile.fullName}
            </Text>
            <Pill tone="neutral">ข้อมูลตัวอย่างในเครื่อง</Pill>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          testID="edit-patient-profile"
          onPress={() => setEditing(true)}
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: colors.secondary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Feather name="edit-2" size={14} color={colors.secondaryForeground} />
          <Text
            style={[styles.editText, { color: colors.secondaryForeground }]}
          >
            แก้ไข
          </Text>
        </Pressable>
      </View>

      {loadError ? (
        <Text style={[styles.loadError, { color: colors.destructive }]}>
          {loadError}
        </Text>
      ) : null}
      <View style={styles.detailGroup}>
        <Text
          style={[styles.groupTitle, { color: colors.secondaryForeground }]}
        >
          ข้อมูลทั่วไป
        </Text>
        <ProfileDataRow
          label="เลขบัตรประชาชน"
          value={maskNationalId(profile.nationalId)}
        />
        <ProfileDataRow
          label="วันเกิด / อายุ"
          value={`${profile.birthDate || "ยังไม่ระบุ"}${age === null ? "" : ` · ${age} ปี`}`}
        />
        <ProfileDataRow label="เพศ" value={profile.gender || "ยังไม่ระบุ"} />
        <ProfileDataRow
          label="เบอร์โทรศัพท์"
          value={profile.phone || "ยังไม่ระบุ"}
        />
        <ProfileDataRow
          label="ที่อยู่"
          value={profile.address || "ยังไม่ระบุ"}
        />
      </View>

      <View style={styles.detailGroup}>
        <Text
          style={[styles.groupTitle, { color: colors.secondaryForeground }]}
        >
          ประวัติสุขภาพ
        </Text>
        <ProfileDataRow label="กรุ๊ปเลือด" value={bloodType || "ยังไม่ระบุ"} />
        <ProfileDataRow
          label="น้ำหนัก / ส่วนสูง"
          value={`${profile.weightKg || "—"} กก. / ${profile.heightCm || "—"} ซม.`}
        />
        <ProfileDataRow
          label="BMI"
          value={bmi === null ? "ยังไม่ระบุ" : bmi.toFixed(1)}
        />
        <ProfileDataRow
          label="โรคประจำตัว"
          value={profile.conditions || "ยังไม่ระบุ"}
        />
        <ProfileDataRow
          label="แพ้ยา"
          value={profile.drugAllergies || "ยังไม่ระบุ"}
        />
        <ProfileDataRow
          label="แพ้อาหาร"
          value={profile.foodAllergies || "ยังไม่ระบุ"}
        />
        <ProfileDataRow
          label="ยาที่ใช้ประจำ"
          value={profile.medications || "ยังไม่ระบุ"}
        />
      </View>

      <View style={styles.detailGroup}>
        <Text
          style={[styles.groupTitle, { color: colors.secondaryForeground }]}
        >
          ผู้ติดต่อและสิทธิรักษา
        </Text>
        <ProfileDataRow
          label="ผู้ติดต่อฉุกเฉิน"
          value={profile.emergencyName || "ยังไม่ระบุ"}
        />
        <ProfileDataRow
          label="ความสัมพันธ์"
          value={profile.emergencyRelation || "ยังไม่ระบุ"}
        />
        <ProfileDataRow
          label="เบอร์ฉุกเฉิน"
          value={profile.emergencyPhone || "ยังไม่ระบุ"}
        />
        <ProfileDataRow
          label="สิทธิรักษา"
          value={profile.coverage || "ยังไม่ระบุ"}
        />
      </View>
    </SurfaceCard>
  );
}

function ProfileDataRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.dataRow, { borderTopColor: colors.border }]}>
      <Text style={[styles.dataLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.dataValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  loadError: { fontSize: 11, lineHeight: 17 },
  summaryCard: { gap: 17 },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  identityCopy: { flex: 1, alignItems: "flex-start", gap: 5 },
  name: { fontSize: 15, fontWeight: "800" },
  editButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editText: { fontSize: 11, fontWeight: "800" },
  detailGroup: { gap: 0 },
  groupTitle: { fontSize: 12, fontWeight: "800", marginBottom: 5 },
  dataRow: {
    minHeight: 38,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  dataLabel: { width: 104, fontSize: 10, lineHeight: 15 },
  dataValue: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "right",
  },
});
