import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BodyText, PrimaryButton, SurfaceCard } from "./UI";
import { useColors } from "@/hooks/useColors";

export type ConsultationDoctor = {
  id: string;
  name: string;
  specialty: string;
  provider: "general" | "resident";
  education: string;
  age: string;
  portrait?: ImageSourcePropType;
  video?: ImageSourcePropType;
};

export const consultationDoctors: ConsultationDoctor[] = [
  {
    id: "madman",
    name: "นพ.มาดแมน แอนแฮนซั่ม",
    specialty: "เวชศาสตร์ครอบครัว",
    provider: "general",
    education: "มหาวิทยาลัยวัวชน · จบปีการศึกษา 2570",
    age: "19 ปี",
    portrait: require("@/assets/telemedicine/doctor-portrait.jpg"),
    video: require("@/assets/telemedicine/doctor-call.jpg"),
  },
  {
    id: "resident-demo",
    name: "พญ.ณิชา สุขใจ",
    specialty: "แพทย์ประจำบ้าน · อายุรศาสตร์",
    provider: "resident",
    education: "คณะแพทยศาสตร์ตัวอย่าง · ข้อมูลสมมติ",
    age: "28 ปี · ข้อมูลสมมติ",
  },
];

export default function DoctorCard({
  doctor,
  onConsult,
}: {
  doctor: ConsultationDoctor;
  onConsult: () => void;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.idHeader}>
        <Text style={[styles.brand, { color: colors.primary }]}>+ Meddy</Text>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>
          ประวัติแพทย์ · ข้อมูลสมมติ
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`ประวัติ ${doctor.name}`}
            accessibilityState={{ expanded }}
            onPress={() => setExpanded(!expanded)}
            style={styles.nameButton}
          >
            <Text style={[styles.name, { color: colors.foreground }]}>
              {doctor.name}
            </Text>
            <Feather
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary}
            />
          </Pressable>
          <Text style={[styles.specialty, { color: colors.mutedForeground }]}>
            {doctor.specialty}
          </Text>
          <Text style={[styles.hint, { color: colors.primary }]}>
            {expanded ? "ซ่อนประวัติ" : "แตะชื่อเพื่อดูประวัติ"}
          </Text>
        </View>
        {doctor.portrait ? (
          <Image
            source={doctor.portrait}
            accessibilityLabel={`ภาพ ${doctor.name}`}
            resizeMode="cover"
            style={styles.portrait}
          />
        ) : (
          <View
            style={[
              styles.portrait,
              styles.placeholder,
              { backgroundColor: colors.secondary },
            ]}
          >
            <Feather name="user" size={38} color={colors.primary} />
          </View>
        )}
      </View>
      {expanded ? (
        <View
          style={[
            styles.details,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.detailHeading, { color: colors.foreground }]}>
            ประวัติการศึกษา
          </Text>
          <BodyText>{doctor.education}</BodyText>
          <BodyText>อายุ: {doctor.age}</BodyText>
          <BodyText>สาขา: {doctor.specialty}</BodyText>
        </View>
      ) : null}
      <PrimaryButton
        title="ปรึกษาแพทย์ท่านนี้"
        icon="video"
        onPress={onConsult}
      />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 18 },
  idHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  brand: { fontSize: 18, fontWeight: "800" },
  caption: { fontSize: 12, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  nameButton: {
    minHeight: 48,
    gap: 6,
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  name: { fontSize: 20, lineHeight: 30, fontWeight: "700", flexShrink: 1 },
  specialty: { fontSize: 15, lineHeight: 24, marginTop: 8 },
  hint: { fontSize: 12, lineHeight: 20, marginTop: 8 },
  portrait: {
    width: 92,
    height: 122,
    borderRadius: 12,
    backgroundColor: "#E7F4F2",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  details: { padding: 16, borderWidth: 1, borderRadius: 16, gap: 8 },
  detailHeading: { fontSize: 16, fontWeight: "700" },
});

