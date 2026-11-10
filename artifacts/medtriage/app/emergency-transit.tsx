import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import {
  BodyText,
  Eyebrow,
  IconButton,
  Pill,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  SurfaceCard,
} from "@/components/UI";
import { useMedtriage } from "@/context/MedtriageContext";
import { useColors } from "@/hooks/useColors";
import {
  directionsUrl,
  estimateTransit,
  hospitalTelephoneUrl,
  resolveTransitHospital,
  TRANSIT_DEMO_ORIGIN,
} from "@/utils/emergencyTransit";

export default function EmergencyTransitScreen() {
  const colors = useColors();
  const { hospitalId } = useLocalSearchParams<{
    hospitalId?: string | string[];
  }>();
  const { selectedHospital, location } = useMedtriage();
  const hospital = resolveTransitHospital(hospitalId, selectedHospital?.id);
  const [error, setError] = useState("");
  const openLink = async (url: string, message: string) => {
    setError("");
    try {
      await Linking.openURL(url);
    } catch {
      setError(message);
    }
  };
  if (!hospital)
    return (
      <Screen contentStyle={styles.page}>
        <SectionTitle title="ไม่พบโรงพยาบาลปลายทาง" />
        <BodyText>กลับไปเลือกโรงพยาบาลอีกครั้ง</BodyText>
        <PrimaryButton
          title="โทรเรียกรถฉุกเฉิน 1669"
          icon="phone"
          onPress={() =>
            void openLink("tel:1669", "เปิดโทรศัพท์ไม่ได้ โปรดโทร 1669 โดยตรง")
          }
        />
        {error ? (
          <Text accessibilityRole="alert" style={{ color: colors.destructive }}>
            {error}
          </Text>
        ) : null}
        <PrimaryButton
          title="เลือกโรงพยาบาล"
          onPress={() =>
            router.replace({
              pathname: "/recommended-hospitals",
              params: { urgent: "1" },
            })
          }
        />
      </Screen>
    );
  const eta = estimateTransit(location ?? TRANSIT_DEMO_ORIGIN, hospital);
  const back = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({
          pathname: "/recommended-hospitals",
          params: { urgent: "1" },
        });
  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          label="กลับไปเลือกโรงพยาบาล"
          onPress={back}
        />
        <View style={styles.headerCopy}>
          <Eyebrow>Meddy · Emergency Transit</Eyebrow>
          <Text style={[styles.title, { color: colors.foreground }]}>
            กำลังเดินทางไปโรงพยาบาล
          </Text>
        </View>
      </View>
      <SurfaceCard style={styles.destination}>
        <Pill tone="teal">ปลายทางที่เลือก</Pill>
        {hospital.photoUrl ? (
          <Image
            source={{ uri: hospital.photoUrl }}
            accessibilityLabel={`ภาพ ${hospital.name}`}
            contentFit="cover"
            style={styles.photo}
          />
        ) : null}
        <Text style={[styles.hospitalName, { color: colors.foreground }]}>
          {hospital.name}
        </Text>
        <BodyText>
          {hospital.area} · {hospital.kind}
        </BodyText>
        <View style={[styles.etaBox, { backgroundColor: colors.secondary }]}>
          <Feather name="clock" size={24} color={colors.secondaryForeground} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={[styles.etaLabel, { color: colors.secondaryForeground }]}
            >
              ETA โดยประมาณ · ตัวอย่าง
            </Text>
            <Text style={[styles.etaTime, { color: colors.foreground }]}>
              {eta.minimumMinutes}–{eta.maximumMinutes} นาที
            </Text>
          </View>
        </View>
        <BodyText>
          {location
            ? "อิงตำแหน่งที่เลือก"
            : "อิงตำแหน่งตัวอย่าง อาคาร บร.1 มธ. รังสิต"}{" "}
          · ระยะเส้นตรง {eta.distanceKm.toFixed(1)} กม.
        </BodyText>
        <BodyText>
          ETA นี้ไม่รวมสภาพจราจร โปรดดูเส้นทางและเวลาจริงในแอปแผนที่
        </BodyText>
        <PrimaryButton
          title="นำทางด้วย Google Maps"
          icon="navigation"
          onPress={() =>
            void openLink(
              directionsUrl(hospital),
              "เปิดแผนที่ไม่ได้ กรุณาลองอีกครั้ง",
            )
          }
        />
        {Platform.OS === "ios" ? (
          <SecondaryButton
            title="เปิดใน Apple Maps"
            icon="map"
            onPress={() =>
              void openLink(
                directionsUrl(hospital, "apple"),
                "เปิด Apple Maps ไม่ได้ กรุณาใช้ Google Maps ด้านบน",
              )
            }
          />
        ) : null}
      </SurfaceCard>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="โทรเรียกรถฉุกเฉิน 1669"
        onPress={() =>
          void openLink(
            "tel:1669",
            "เปิดโทรศัพท์ไม่ได้ โปรดใช้โทรศัพท์โทร 1669 โดยตรง",
          )
        }
        style={({ pressed }) => [
          styles.emergencyButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="phone-call" size={25} color="#FFFFFF" />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.emergencyTitle}>โทรเรียกรถฉุกเฉิน 1669</Text>
          <Text style={styles.emergencyDetail}>
            หากอาการแย่ลงหรือเกิดเหตุฉุกเฉินระหว่างทาง
          </Text>
        </View>
      </Pressable>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: colors.destructive, fontSize: 15 }}
        >
          {error}
        </Text>
      ) : null}
      <SurfaceCard style={{ gap: 14 }}>
        <SectionTitle title="เตรียมตัวระหว่างเดินทาง" />
        {[
          "เตรียมบัตรประชาชน รายชื่อยา และข้อมูลแพ้ยา หากมี โดยไม่ทำให้การเดินทางล่าช้า",
          "สังเกตอาการ หากหมดสติหรืออาการแย่ลง ให้โทร 1669 ทันที และทำตามคำแนะนำเจ้าหน้าที่",
          "ให้ผู้ดูแลเป็นผู้กดใช้งานแอประหว่างเดินทาง",
        ].map((text, index) => (
          <View key={text} style={styles.preparationRow}>
            <Feather
              name="check-circle"
              size={19}
              color={colors.secondaryForeground}
            />
            <Text
              style={[styles.preparationText, { color: colors.foreground }]}
            >
              {text}
            </Text>
          </View>
        ))}
      </SurfaceCard>
      <SurfaceCard style={{ gap: 10 }}>
        <SectionTitle title="ติดต่อโรงพยาบาลปลายทาง" />
        <BodyText>เบอร์กลางโรงพยาบาล · สอบถามการติดต่อห้องฉุกเฉิน</BodyText>
        <Text selectable style={[styles.phone, { color: colors.foreground }]}>
          {hospital.phone}
        </Text>
        <SecondaryButton
          title="โทรเบอร์กลางโรงพยาบาล"
          icon="phone"
          onPress={() =>
            void openLink(
              hospitalTelephoneUrl(hospital.phone),
              `เปิดโทรศัพท์ไม่ได้ กรุณาโทร ${hospital.phone} โดยตรง`,
            )
          }
        />
      </SurfaceCard>
      <BodyText style={{ textAlign: "center" }}>
        หน้าจอนี้เป็นสถานะตัวอย่าง
        ยังไม่ได้แจ้งการเดินทางหรือส่งข้อมูลให้โรงพยาบาล
      </BodyText>
    </Screen>
  );
}
const styles = StyleSheet.create({
  page: { gap: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerCopy: { flex: 1, gap: 4, minWidth: 0 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: "800" },
  destination: { gap: 13 },
  hospitalName: { fontSize: 21, lineHeight: 30, fontWeight: "800" },
  photo: { width: "100%", height: 165, borderRadius: 15 },
  etaBox: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  etaLabel: { fontSize: 13, fontWeight: "700" },
  etaTime: { fontSize: 30, lineHeight: 39, fontWeight: "800" },
  emergencyButton: {
    backgroundColor: "#B4232D",
    borderRadius: 18,
    padding: 18,
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  emergencyTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 27,
    fontWeight: "800",
  },
  emergencyDetail: { color: "#FFFFFF", fontSize: 13, lineHeight: 20 },
  preparationRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  preparationText: { flex: 1, fontSize: 15, lineHeight: 24 },
  phone: { fontSize: 22, fontWeight: "800" },
});
