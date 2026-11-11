import React from "react";
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PrimaryButton, SurfaceCard } from "./UI";
import { useColors } from "@/hooks/useColors";

export type ConsultationDoctor = {
  id: string;
  name: string;
  specialty: string;
  provider: "general" | "resident";
  education?: { degree: string; institution: string; graduationYear: number }[];
  age?: string;
  academicTitle?: string;
  position?: string;
  licenseNumber?: string;
  expertise?: string[];
  experience?: { role: string; institution: string }[];
  languages?: string[];
  schedule?: { days: string; hours: string }[];
  philosophy?: string;
  portrait?: ImageSourcePropType;
  video?: ImageSourcePropType;
};

export const consultationDoctors: ConsultationDoctor[] = [
  {
    id: "madman",
    name: "นพ.มาดแมน แอนแฮนซั่ม",
    specialty: "เวชศาสตร์ครอบครัว",
    provider: "general",
    portrait: require("@/assets/telemedicine/doctor-portrait.jpg"),
    video: require("@/assets/telemedicine/doctor-call.jpg"),
  },
  {
    id: "resident-demo",
    name: "พญ.ณิชา สุขใจ",
    specialty: "อายุรศาสตร์",
    provider: "resident",
  },
];

export default function DoctorCard({ doctor, onConsult }: { doctor: ConsultationDoctor; onConsult: () => void }) {
  const colors = useColors();
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.topLine}>
        <Text style={[styles.brand, { color: colors.primary }]}>+ Meddy</Text>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>ข้อมูลแพทย์ตัวอย่าง</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.name, { color: colors.foreground }]}>{doctor.name}</Text>
          <Text style={[styles.specialty, { color: colors.mutedForeground }]}>{doctor.specialty}</Text>
          <View style={styles.providerRow}>
            <Feather name="check-circle" size={15} color={colors.primary} />
            <Text style={[styles.provider, { color: colors.primary }]}>
              {doctor.provider === "general" ? "แพทย์ทั่วไป" : "แพทย์ประจำบ้าน"}
            </Text>
          </View>
        </View>
        {doctor.portrait ? (
          <Image source={doctor.portrait} accessibilityLabel={`ภาพ ${doctor.name}`} resizeMode="cover" style={styles.portrait} />
        ) : (
          <View style={[styles.portrait, styles.placeholder, { backgroundColor: colors.secondary }]}>
            <Feather name="user" size={34} color={colors.primary} />
          </View>
        )}
      </View>
      <PrimaryButton title="ปรึกษาแพทย์" icon="video" onPress={onConsult} />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 },
  brand: { fontSize: 17, fontWeight: "800" },
  caption: { fontSize: 12, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  copy: { flex: 1, minWidth: 0, gap: 7 },
  name: { fontSize: 19, lineHeight: 28, fontWeight: "700" },
  specialty: { fontSize: 15, lineHeight: 23 },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  provider: { fontSize: 13, lineHeight: 21, fontWeight: "700" },
  portrait: { width: 86, height: 112, borderRadius: 7, borderWidth: 1, borderColor: "#D8E6E3", backgroundColor: "#E7F4F2" },
  placeholder: { alignItems: "center", justifyContent: "center" },
});

