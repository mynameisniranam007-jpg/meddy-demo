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
  education: { degree: string; institution: string; graduationYear: number }[];
  age: string;
  academicTitle: string;
  position: string;
  licenseNumber: string;
  expertise: string[];
  experience: { role: string; institution: string }[];
  languages: string[];
  schedule: { days: string; hours: string }[];
  philosophy: string;
  portrait?: ImageSourcePropType;
  video?: ImageSourcePropType;
};

export const consultationDoctors: ConsultationDoctor[] = [
  {
    id: "madman",
    name: "นพ.มาดแมน แอนแฮนซั่ม",
    specialty: "แพทย์เชี่ยวชาญด้านเวชศาสตร์ครอบครัว",
    provider: "general",
    education: [{ degree: "แพทยศาสตรบัณฑิต", institution: "มหาวิทยาลัยวัวชน", graduationYear: 2570 }],
    age: "19 ปี",
    academicTitle: "ไม่มีตำแหน่งทางวิชาการ",
    position: "แพทย์ที่ปรึกษาประจำ Meddy",
    licenseNumber: "ว.2570-8888",
    expertise: ["เวชศาสตร์ครอบครัว", "การคัดกรองอาการผู้สูงอายุ", "การประเมินสุขภาพจิตเบื้องต้น"],
    experience: [
      { role: "อดีตแพทย์ฝึกหัด", institution: "ศูนย์การแพทย์ชุมชนวัวชน" },
      { role: "แพทย์ที่ปรึกษาประจำ", institution: "Meddy" },
    ],
    languages: ["ไทย (สำเนียงใต้ / กลาง)", "อังกฤษ"],
    schedule: [{ days: "จันทร์ – ศุกร์", hours: "09:00 – 17:00 น." }],
    philosophy: "รับฟังให้เข้าใจ ดูแลด้วยหัวใจ ให้ทุกคนเข้าถึงสุขภาพที่ดี",
    portrait: require("@/assets/telemedicine/doctor-portrait.jpg"),
    video: require("@/assets/telemedicine/doctor-call.jpg"),
  },
  {
    id: "resident-demo",
    name: "พญ.ณิชา สุขใจ",
    specialty: "แพทย์ประจำบ้าน · อายุรศาสตร์",
    provider: "resident",
    education: [{ degree: "แพทยศาสตรบัณฑิต", institution: "คณะแพทยศาสตร์ตัวอย่าง", graduationYear: 2565 }],
    age: "28 ปี · ข้อมูลสมมติ",
    academicTitle: "ไม่มีตำแหน่งทางวิชาการ",
    position: "แพทย์ประจำบ้าน",
    licenseNumber: "ว.2565-9999",
    expertise: ["การคัดกรองอาการเบื้องต้น", "การดูแลผู้ป่วยโรคเรื้อรัง", "เวชศาสตร์ป้องกัน"],
    experience: [
      { role: "แพทย์ฝึกหัด", institution: "โรงพยาบาลตัวอย่าง" },
      { role: "แพทย์ประจำบ้านสาขาอายุรศาสตร์", institution: "ศูนย์การแพทย์ตัวอย่าง" },
    ],
    languages: ["ไทย", "อังกฤษ"],
    schedule: [{ days: "จันทร์ / พุธ / ศุกร์", hours: "17:00 – 21:00 น." }],
    philosophy: "อธิบายให้เข้าใจ ร่วมวางแผนดูแลสุขภาพไปด้วยกัน",
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`ประวัติ ${doctor.name}`}
        accessibilityHint="แตะเพื่อเปิดหรือปิดรายละเอียดประวัติแพทย์"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
      >
        <View style={styles.copy}>
          <View style={styles.nameButton}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {doctor.name}
            </Text>
            <Feather
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.specialty, { color: colors.mutedForeground }]}>
            {doctor.specialty}
          </Text>
          <Text style={[styles.hint, { color: colors.primary }]}>
            {expanded ? "ซ่อนประวัติ" : "แตะการ์ดเพื่อดูประวัติ"}
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
      </Pressable>
      {expanded ? (
        <View style={styles.details}>
          <View style={[styles.basicInfo, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Text accessibilityRole="header" style={[styles.detailHeading, { color: colors.primary }]}>ข้อมูลพื้นฐาน</Text>
            {[
              ["ชื่อ-นามสกุล", doctor.name],
              ["ตำแหน่งวิชาการ", doctor.academicTitle],
              ["ตำแหน่งปัจจุบัน", doctor.position],
              ["สาขาเฉพาะทาง", doctor.specialty],
              ["อายุ", doctor.age],
              ["เลขใบอนุญาต (สมมติ)", doctor.licenseNumber],
            ].map(([label, value]) => (
              <View key={label} style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text selectable style={[styles.fieldValue, { color: colors.foreground }]}>{value}</Text>
              </View>
            ))}
          </View>
          <ProfileSection title="ประวัติการศึกษา" icon="book-open">
            {doctor.education.map((item) => (
              <View key={`${item.institution}-${item.degree}-${item.graduationYear}`} style={styles.field}>
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>{item.degree}</Text>
                <BodyText>{item.institution}</BodyText>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>จบปีการศึกษา พ.ศ. {item.graduationYear}</Text>
              </View>
            ))}
          </ProfileSection>
          <ProfileSection title="ความชำนาญพิเศษ" icon="activity">
            {doctor.expertise.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Feather name="check-circle" size={18} color={colors.primary} style={{ marginTop: 4 }} />
                <Text style={[styles.listText, { color: colors.foreground }]}>{item}</Text>
              </View>
            ))}
          </ProfileSection>
          <ProfileSection title="ประสบการณ์การทำงาน" icon="briefcase">
            {doctor.experience.map((item) => (
              <View key={`${item.institution}-${item.role}`} style={styles.field}>
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>{item.role}</Text>
                <BodyText>{item.institution}</BodyText>
              </View>
            ))}
          </ProfileSection>
          <ProfileSection title="ภาษาที่สื่อสารได้" icon="globe">
            <View style={styles.chips}>
              {doctor.languages.map((language) => (
                <View key={language} style={[styles.chip, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.chipText, { color: colors.primary }]}>{language}</Text>
                </View>
              ))}
            </View>
          </ProfileSection>
          <ProfileSection title="ตารางเวลา Telemedicine" icon="calendar">
            {doctor.schedule.map((item) => (
              <View key={`${item.days}-${item.hours}`} style={styles.field}>
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>{item.days}</Text>
                <BodyText>{item.hours}</BodyText>
              </View>
            ))}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>ตารางตัวอย่างสำหรับการนำเสนอ</Text>
          </ProfileSection>
          <View style={[styles.philosophy, { backgroundColor: colors.secondary }]}>
            <Feather name="heart" size={22} color={colors.primary} />
            <Text accessibilityRole="header" style={[styles.detailHeading, { color: colors.primary }]}>แนวทางการดูแลคนไข้</Text>
            <Text style={[styles.quote, { color: colors.primary }]}>“{doctor.philosophy}”</Text>
          </View>
        </View>
      ) : null}
      <PrimaryButton title={expanded ? "นัดหมายปรึกษา" : "ปรึกษาแพทย์"} icon="video" onPress={onConsult} />
    </SurfaceCard>
  );
}

function ProfileSection({ title, icon, children }: {
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.section, { borderColor: colors.border }]}>
      <View style={styles.sectionHeading}>
        <Feather name={icon} size={20} color={colors.primary} />
        <Text accessibilityRole="header" style={[styles.detailHeading, { color: colors.primary }]}>{title}</Text>
      </View>
      {children}
    </View>
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
  hint: { fontSize: 14, lineHeight: 23, marginTop: 8 },
  portrait: {
    width: 92,
    height: 122,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D8E6E3",
    backgroundColor: "#E7F4F2",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  details: { gap: 20 },
  detailHeading: { fontSize: 17, lineHeight: 27, fontWeight: "700", flexShrink: 1 },
  basicInfo: { padding: 16, borderWidth: 1, borderRadius: 16, gap: 14 },
  field: { gap: 4, minWidth: 0 },
  fieldLabel: { fontSize: 14, lineHeight: 23, flexShrink: 1 },
  fieldValue: { fontSize: 16, lineHeight: 26, fontWeight: "600", flexShrink: 1 },
  section: { borderTopWidth: 1, paddingTop: 20, gap: 12 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  listText: { flex: 1, minWidth: 0, fontSize: 16, lineHeight: 26 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, maxWidth: "100%" },
  chipText: { fontSize: 15, lineHeight: 24, flexShrink: 1 },
  philosophy: { padding: 18, borderRadius: 16, gap: 10 },
  quote: { fontSize: 16, lineHeight: 28 },
});
