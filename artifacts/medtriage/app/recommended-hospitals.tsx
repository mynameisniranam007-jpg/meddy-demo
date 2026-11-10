import React, { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  Eyebrow,
  IconButton,
  Pill,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SurfaceCard,
} from "@/components/UI";
import { distanceInKm, Hospital, hospitals } from "@/constants/data";
import { useMedtriage } from "@/context/MedtriageContext";
import { useColors } from "@/hooks/useColors";

const BR1_REFERENCE = { latitude: 14.0705, longitude: 100.6045 };

function departmentFor(text: string) {
  const value = text.toLowerCase();
  if (["คอ", "กลืน", "เสียงแหบ", "เจ็บคอ"].some((word) => value.includes(word)))
    return "หู คอ จมูก";
  if (
    ["หน้าอก", "หอบ", "หายใจ", "เจ็บหน้าอก", "ไอ", "ปอด"].some((word) =>
      value.includes(word),
    )
  )
    return "อายุรกรรมระบบทางเดินหายใจ";
  if (
    ["ศีรษะ", "หัว", "ไมเกรน", "ชา", "ชัก", "เวียนหัว"].some((word) =>
      value.includes(word),
    )
  )
    return "อายุรกรรมระบบประสาท";
  if (
    ["ท้อง", "คลื่นไส้", "อาเจียน", "ท้องเสีย"].some((word) =>
      value.includes(word),
    )
  )
    return "อายุรกรรมระบบทางเดินอาหาร";
  if (
    ["หลัง", "กระดูก", "ข้อ", "เข่า", "แขน", "ขา", "กล้ามเนื้อ"].some((word) =>
      value.includes(word),
    )
  )
    return "กระดูกและข้อ";
  return "อายุรกรรมทั่วไป";
}

export default function RecommendedHospitalsScreen() {
  const colors = useColors();
  const { symptoms, bodyParts, location, setLocation, setSelectedHospital } =
    useMedtriage();
  const params = useLocalSearchParams<{ urgent?: string }>();
  const urgent = params.urgent === "1";
  const [locating, setLocating] = useState(false);
  const origin = location ?? BR1_REFERENCE;
  const department = departmentFor(`${symptoms} ${bodyParts.join(" ")}`);
  const matches = useMemo(
    () =>
      [...hospitals]
        .sort((a, b) => distanceInKm(origin, a) - distanceInKm(origin, b))
        .slice(0, 5),
    [location],
  );

  const findLocation = async () => {
    setLocating(true);
    try {
      if (Platform.OS === "web") {
        if (!navigator.geolocation) throw new Error("NO_GEO");
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            setLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
            setLocating(false);
          },
          () => {
            Alert.alert(
              "ยังไม่ได้รับตำแหน่ง",
              "อนุญาตการเข้าถึงตำแหน่ง หรือลองอีกครั้งภายหลัง",
            );
            setLocating(false);
          },
          { enableHighAccuracy: true, timeout: 12000 },
        );
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "ยังไม่ได้รับตำแหน่ง",
          "อนุญาตให้ใช้ตำแหน่งเพื่อคำนวณระยะทาง",
        );
        return;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch {
      Alert.alert(
        "ระบุตำแหน่งไม่ได้",
        "ขณะนี้แสดงระยะทางตัวอย่างจากอาคาร บร.1 มหาวิทยาลัยธรรมศาสตร์",
      );
    } finally {
      setLocating(false);
    }
  };

  if (urgent) {
    const urgentHospitals = [...hospitals]
      .sort((a, b) => distanceInKm(origin, a) - distanceInKm(origin, b))
      .slice(0, 5);
    const loadById: Record<string, string> = {
      thammasat: "ปานกลาง",
      phatara: "น้อย",
      "pat-rangsit": "น้อย",
      "pathum-thani": "มาก",
      "st-carlos": "ปานกลาง",
    };
    return (
      <Screen contentStyle={styles.page}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            label="ย้อนกลับ"
            onPress={() => router.back()}
          />
          <View style={styles.headerCopy}>
            <Eyebrow>กรณีเร่งด่วน · ตัวอย่าง</Eyebrow>
            <Text style={[styles.title, { color: colors.foreground }]}>
              ไปห้องฉุกเฉิน
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.urgentNotice}>
          <Feather name="alert-triangle" size={27} color="#fff" />
          <Text style={styles.urgentHeading}>ควรไปโรงพยาบาลทันที</Text>
          <Text style={styles.urgentCopy}>
            หากเป็นเหตุฉุกเฉิน โทร 1669 อย่ารอคิวหรือเลือกเวลานัด
            ข้อมูลความหนาแน่นนี้เป็นข้อมูลจำลอง ไม่ใช่สถานะสด
          </Text>
        </View>
        {urgentHospitals.map((h) => {
          const km = distanceInKm(origin, h);
          return (
            <SurfaceCard key={h.id} style={styles.card}>
              {h.photoUrl ? (
                <Image
                  source={{ uri: h.photoUrl }}
                  contentFit="cover"
                  style={styles.photo}
                />
              ) : (
                <View
                  style={[
                    styles.photoPlaceholder,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Feather
                    name="plus-square"
                    size={28}
                    color={colors.secondaryForeground}
                  />
                </View>
              )}
              <Text style={[styles.name, { color: colors.foreground }]}>
                {h.name}
              </Text>
              <Text style={[styles.area, { color: colors.mutedForeground }]}>
                {h.kind} · {km.toFixed(1)} กม.
              </Text>
              <Text
                style={{
                  color: loadById[h.id] === "น้อย" ? "#238052" : "#A56A00",
                  fontWeight: "800",
                }}
              >
                ห้องฉุกเฉิน: {loadById[h.id] ?? "ปานกลาง"} · จำลอง
              </Text>
              <PrimaryButton
                title="กำลังไปโรงพยาบาลนี้"
                icon="navigation"
                onPress={() => {
                  setSelectedHospital(h);
                  router.push({
                    pathname: "/emergency-transit",
                    params: { hospitalId: h.id },
                  });
                }}
              />
            </SurfaceCard>
          );
        })}
      </Screen>
    );
  }
  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          label="ย้อนกลับ"
          onPress={() => router.back()}
        />
        <View style={styles.headerCopy}>
          <Eyebrow>จากข้อมูลอาการที่กรอก</Eyebrow>
          <Text style={[styles.title, { color: colors.foreground }]}>
            เลือกโรงพยาบาล
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
      <View style={[styles.note, { backgroundColor: colors.secondary }]}>
        <Feather name="info" size={16} color={colors.secondaryForeground} />
        <Text style={[styles.noteText, { color: colors.secondaryForeground }]}>
          อิงตำแหน่งที่เลือกและตำแหน่งอาการเพื่อแสดงแผนกที่เกี่ยวข้อง:{" "}
          {department} · ระยะทางเป็นตัวอย่าง
        </Text>
      </View>
      <View style={styles.locationRow}>
        <View style={styles.locationCopy}>
          <Text style={[styles.locationTitle, { color: colors.foreground }]}>
            {location
              ? "ระยะทางจากตำแหน่งของคุณ"
              : "ระยะทางตัวอย่างจากอาคาร บร.1 มธ. รังสิต"}
          </Text>
          <Text
            style={[styles.locationSubtitle, { color: colors.mutedForeground }]}
          >
            ระยะทางเส้นตรงโดยประมาณ
          </Text>
        </View>
        <SecondaryButton
          title={locating ? "กำลังค้นหา" : "ใช้ตำแหน่งฉัน"}
          icon="map-pin"
          onPress={() => void findLocation()}
          style={styles.locationButton}
        />
      </View>
      {matches.map((hospital) => {
        const km = distanceInKm(origin, hospital);
        return (
          <SurfaceCard key={hospital.id} style={styles.card}>
            {hospital.photoUrl ? (
              <Image
                source={{ uri: hospital.photoUrl }}
                contentFit="cover"
                style={styles.photo}
              />
            ) : (
              <View
                style={[
                  styles.photoPlaceholder,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather
                  name="plus-square"
                  size={30}
                  color={colors.secondaryForeground}
                />
                <Text
                  style={[
                    styles.placeholderText,
                    { color: colors.secondaryForeground },
                  ]}
                >
                  ไม่มีภาพถ่ายในชุดตัวอย่าง
                </Text>
              </View>
            )}
            <View style={styles.nameRow}>
              <View style={styles.nameCopy}>
                <Text style={[styles.name, { color: colors.foreground }]}>
                  {hospital.name}
                </Text>
                <Text style={[styles.area, { color: colors.mutedForeground }]}>
                  {hospital.area}
                </Text>
              </View>
              <Pill tone={hospital.kind === "โรงพยาบาลรัฐ" ? "blue" : "teal"}>
                {hospital.kind === "โรงพยาบาลรัฐ" ? "รัฐ" : "เอกชน"}
              </Pill>
            </View>
            <Text style={[styles.department, { color: colors.foreground }]}>
              แผนกที่แนะนำ: {department}{" "}
              <Text style={{ color: colors.mutedForeground }}>(ตัวอย่าง)</Text>
            </Text>
            <View
              style={[
                styles.distanceRow,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Feather
                name="map-pin"
                size={14}
                color={colors.secondaryForeground}
              />
              <Text
                style={[styles.distance, { color: colors.secondaryForeground }]}
              >
                {km < 1
                  ? `${Math.round(km * 1000)} เมตร`
                  : `${km.toFixed(1)} กม.`}{" "}
                · {hospital.specialty}
              </Text>
            </View>
            <View
              style={[styles.costBox, { backgroundColor: colors.background }]}
            >
              <Text
                style={[styles.costLabel, { color: colors.mutedForeground }]}
              >
                ค่าใช้จ่ายโดยประมาณ · ตัวเลขสมมติ
              </Text>
              <Text style={[styles.cost, { color: colors.foreground }]}>
                {hospital.cost}
              </Text>
              <Text
                style={[styles.costNote, { color: colors.mutedForeground }]}
              >
                {hospital.costNote}
              </Text>
            </View>
            <PrimaryButton
              title="เลือกโรงพยาบาลและจองคิว"
              icon="calendar"
              onPress={() => {
                setSelectedHospital(hospital);
                router.push({
                  pathname: "/booking",
                  params: {
                    hospitalId: hospital.id,
                    department,
                    mode: "advance",
                  },
                });
              }}
            />
          </SurfaceCard>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  urgentNotice: {
    backgroundColor: "#B4232D",
    borderRadius: 17,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  urgentHeading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  urgentCopy: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  page: { gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: { alignItems: "center", gap: 3 },
  title: { fontSize: 18, fontWeight: "800" },
  note: {
    borderRadius: 13,
    padding: 12,
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 19, fontWeight: "600" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  locationCopy: { flex: 1, gap: 3 },
  locationTitle: { fontSize: 12, fontWeight: "700" },
  locationSubtitle: { fontSize: 10 },
  locationButton: { minHeight: 38, paddingHorizontal: 8 },
  card: { gap: 11, padding: 14 },
  photo: {
    height: 155,
    width: "100%",
    borderRadius: 15,
    backgroundColor: "#DCE9ED",
  },
  photoPlaceholder: {
    height: 155,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: { fontSize: 11 },
  nameRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  nameCopy: { flex: 1, gap: 3, minWidth: 0 },
  name: { fontSize: 14, lineHeight: 20, fontWeight: "800", flexShrink: 1 },
  area: { fontSize: 10 },
  department: { fontSize: 12, lineHeight: 18, fontWeight: "700" },
  distanceRow: {
    minHeight: 40,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  distance: { flex: 1, fontSize: 12, fontWeight: "700" },
  costBox: { padding: 11, borderRadius: 13, gap: 4 },
  costLabel: { fontSize: 10 },
  cost: { fontSize: 14, fontWeight: "800" },
  costNote: { fontSize: 10, lineHeight: 15 },
});
