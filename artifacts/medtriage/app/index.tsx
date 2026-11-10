import React from "react";
import { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screen, PrimaryButton, SecondaryButton } from "@/components/UI";
import { useColors } from "@/hooks/useColors";
import { demoGuestProfile, PROFILE_STORAGE_KEY } from "@/constants/profile";

export default function WelcomeScreen() {
  const colors = useColors();
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const [startingGuest, setStartingGuest] = useState(false);
  const startGuestDemo = async () => {
    setStartingGuest(true);
    try {
      router.push("/triage");
    } catch {
      Alert.alert("เปิดโหมดทดลองไม่ได้", "โปรดลองอีกครั้ง");
      setStartingGuest(false);
    }
  };
  return (
    <Screen
      scroll={false}
      contentStyle={[
        styles.page,
        {
          gap: compact ? 9 : 14,
          justifyContent: "flex-start",
          paddingTop: compact ? 8 : 16,
          paddingBottom: compact ? 8 : 16,
        },
      ]}
    >
      <View style={styles.brandRow}>
        <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={25} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.brandName, { color: colors.foreground }]}>
          Meddy
        </Text>
        <Text style={[styles.demoTag, { color: colors.secondaryForeground }]}>
          ทดลอง
        </Text>
      </View>
      <LinearGradient
        colors={[colors.primary, "#155373", "#187C7A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.hero,
          {
            minHeight: compact ? 150 : 235,
            padding: compact ? 16 : 22,
            gap: compact ? 7 : 10,
          },
        ]}
      >
        <View style={styles.heroIcon}>
          <Feather name="heart" size={23} color="#FFFFFF" />
        </View>
        <Text style={styles.heroEyebrow}>สุขภาพดี เริ่มต้นที่เข้าใจ</Text>
        <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
          ดูแลสุขภาพ{"\n"}ได้ง่ายขึ้นทุกวัน
        </Text>
        <Text
          style={[
            styles.heroDescription,
            compact && styles.heroDescriptionCompact,
          ]}
        >
          เริ่มจากประเมินอาการเบื้องต้น แล้วค้นหาบริการสุขภาพที่เหมาะกับคุณ
        </Text>
      </LinearGradient>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          ยินดีต้อนรับสู่ Meddy
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          คัดกรองก่อนได้ สมัครเมื่อพร้อมจองคิว
        </Text>
      </View>
      <PrimaryButton
        title="คัดกรองอาการทันที · ไม่ต้องสมัคร"
        icon="activity"
        onPress={() => void startGuestDemo()}
        testID="open-anonymous-demo"
      />
      <SecondaryButton
        title="สมัครสมาชิก"
        icon="user-plus"
        onPress={() => router.push("/register")}
        testID="open-register"
      />
      <SecondaryButton
        title="เข้าสู่ระบบ"
        icon="log-in"
        onPress={() => router.push("/login")}
        testID="open-login"
      />
      <View style={[styles.notice, { backgroundColor: colors.secondary }]}>
        <Feather name="shield" size={16} color={colors.secondaryForeground} />
        <Text
          style={[styles.noticeText, { color: colors.secondaryForeground }]}
        >
          ต้นแบบนี้ยังไม่เชื่อมระบบหมอพร้อมหรือยืนยันตัวตนจริง
          โปรดใช้ข้อมูลสมมติ
        </Text>
      </View>
      <Text style={[styles.help, { color: colors.secondaryForeground }]}>
        ดูแลข้อมูลสุขภาพของคุณอย่างปลอดภัย
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 14, justifyContent: "flex-start" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 20, fontWeight: "800", flex: 1 },
  demoTag: {
    backgroundColor: "rgba(23,107,104,0.12)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 10,
    fontWeight: "800",
  },
  hero: {
    minHeight: 235,
    padding: 22,
    borderRadius: 28,
    justifyContent: "flex-end",
    gap: 10,
    overflow: "hidden",
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 40,
    fontWeight: "800",
  },
  heroDescription: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 320,
  },
  heroTitleCompact: { fontSize: 25, lineHeight: 31 },
  heroDescriptionCompact: { fontSize: 12, lineHeight: 17 },
  copy: { gap: 5 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 21 },
  notice: {
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 17 },
  help: { textAlign: "center", fontSize: 12, fontWeight: "700", padding: 8 },
});
