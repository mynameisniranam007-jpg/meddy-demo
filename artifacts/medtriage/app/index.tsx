import React from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { PrimaryButton, SecondaryButton } from "@/components/UI";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 860;
  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.page,
        {
          paddingTop: Platform.OS === "web" ? 24 : insets.top + 12,
          paddingBottom: insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.nav}>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={25} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              Meddy
            </Text>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/login")}
            style={styles.navLink}
            testID="open-login"
          >
            <Text
              style={{ color: colors.primary, fontSize: 14, fontWeight: "700" }}
            >
              เข้าสู่ระบบ
            </Text>
            <Feather name="arrow-up-right" size={17} color={colors.primary} />
          </Pressable>
        </View>
        <View
          style={[
            styles.hero,
            {
              flexDirection: wide ? "row" : "column",
              paddingVertical: wide ? 64 : 30,
            },
          ]}
        >
          <View
            style={[
              styles.copy,
              { alignItems: wide ? "flex-start" : "center" },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Feather
                name="heart"
                size={14}
                color={colors.secondaryForeground}
              />
              <Text
                style={{
                  color: colors.secondaryForeground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                สุขภาพของคุณ เริ่มต้นที่ความเข้าใจ
              </Text>
            </View>
            <Text
              accessibilityRole="header"
              style={[
                styles.title,
                {
                  color: colors.foreground,
                  fontSize: wide ? 62 : 39,
                  lineHeight: wide ? 80 : 55,
                  textAlign: wide ? "left" : "center",
                },
              ]}
            >
              ดูแลสุขภาพ{"\n"}
              <Text style={{ color: colors.primary }}>ให้ง่ายขึ้นทุกวัน</Text>
            </Text>
            <Text
              style={[
                styles.description,
                {
                  color: colors.mutedForeground,
                  textAlign: wide ? "left" : "center",
                },
              ]}
            >
              เริ่มจากเข้าใจอาการ เลือกโรงพยาบาล และเตรียมนัดหมาย
              ทุกขั้นตอนอยู่ใกล้คุณมากขึ้น
            </Text>
            <View style={styles.actions}>
              <PrimaryButton
                title="เริ่มคัดกรองอาการ"
                icon="arrow-right"
                onPress={() => router.push("/triage")}
                testID="open-anonymous-demo"
              />
              <SecondaryButton
                title="สมัครสมาชิก"
                icon="user-plus"
                onPress={() => router.push("/register")}
                testID="open-register"
              />
              <Text style={[styles.caption, { color: colors.mutedForeground }]}>
                คัดกรองก่อนได้ โดยไม่ต้องมีบัญชี
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.showcase,
              {
                backgroundColor: colors.secondary,
                width: wide ? 390 : "100%",
                maxWidth: 390,
              },
            ]}
          >
            <View
              style={[
                styles.phone,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.foreground,
                },
              ]}
            >
              <View
                style={[styles.notch, { backgroundColor: colors.foreground }]}
              />
              <View style={styles.phoneBrand}>
                <View
                  style={[styles.tinyLogo, { backgroundColor: colors.primary }]}
                >
                  <Feather
                    name="plus"
                    size={17}
                    color={colors.primaryForeground}
                  />
                </View>
                <Text
                  style={{
                    color: colors.foreground,
                    fontWeight: "800",
                    fontSize: 17,
                  }}
                >
                  Meddy
                </Text>
                <Text style={[styles.demo, { color: colors.mutedForeground }]}>
                  ตัวอย่าง
                </Text>
              </View>
              <Text
                style={[styles.phoneGreeting, { color: colors.foreground }]}
              >
                วันนี้คุณรู้สึก{"\n"}เป็นอย่างไรบ้าง?
              </Text>
              <View
                style={[styles.mockCard, { backgroundColor: colors.primary }]}
              >
                <Feather
                  name="activity"
                  size={27}
                  color={colors.primaryForeground}
                />
                <Text
                  style={[
                    styles.mockTitle,
                    { color: colors.primaryForeground },
                  ]}
                >
                  เริ่มประเมินอาการ
                </Text>
                <Text
                  style={{
                    color: colors.primaryForeground,
                    fontSize: 12,
                    lineHeight: 20,
                  }}
                >
                  เข้าใจอาการ เพื่อเลือกการดูแลที่เหมาะสม
                </Text>
              </View>
              {[
                {
                  icon: "map-pin",
                  title: "โรงพยาบาลใกล้คุณ",
                  detail: "ค้นหาปลายทางที่เหมาะสม",
                },
                {
                  icon: "calendar",
                  title: "จัดการนัดหมาย",
                  detail: "เตรียมพร้อมก่อนเข้ารับบริการ",
                },
              ].map((item) => (
                <View
                  key={item.title}
                  style={[styles.mockRow, { borderColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.mockIcon,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Feather
                      name={item.icon as "map-pin" | "calendar"}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{ color: colors.mutedForeground, fontSize: 11 }}
                    >
                      {item.detail}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={styles.mockTabs}>
                {["home", "plus-square", "book-open", "user"].map((icon) => (
                  <Feather
                    key={icon}
                    name={icon as "home"}
                    size={20}
                    color={
                      icon === "home" ? colors.primary : colors.mutedForeground
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.features, { borderColor: colors.border }]}>
          {[
            {
              icon: "activity",
              title: "เข้าใจอาการ",
              detail: "คัดกรองเบื้องต้นได้ทันที",
            },
            {
              icon: "users",
              title: "ดูแลคนที่คุณรัก",
              detail: "จัดการโปรไฟล์ครอบครัว",
            },
            {
              icon: "navigation",
              title: "พร้อมเมื่อเร่งด่วน",
              detail: "ข้อมูลและเส้นทางไปโรงพยาบาล",
            },
          ].map((item) => (
            <View key={item.title} style={styles.feature}>
              <Feather
                name={item.icon as "activity"}
                size={22}
                color={colors.primary}
              />
              <Text
                style={{
                  color: colors.foreground,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 13,
                  lineHeight: 21,
                }}
              >
                {item.detail}
              </Text>
            </View>
          ))}
        </View>
        <Text
          style={[
            styles.caption,
            { color: colors.mutedForeground, marginTop: 24 },
          ]}
        >
          ต้นแบบสำหรับสาธิต · ใช้ข้อมูลสมมติ · ผลคัดกรองไม่ใช่การวินิจฉัย
        </Text>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingHorizontal: 20, alignItems: "center" },
  container: { width: "100%", maxWidth: 1080 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 24, fontWeight: "800", letterSpacing: -0.6 },
  navLink: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hero: { alignItems: "center", justifyContent: "space-between", gap: 36 },
  copy: { flex: 1, gap: 22, width: "100%", minWidth: 0 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
  },
  title: { fontWeight: "800", letterSpacing: -1.4 },
  description: { fontSize: 16, lineHeight: 28, maxWidth: 440 },
  actions: { gap: 12, width: "100%", maxWidth: 350 },
  caption: { fontSize: 12, lineHeight: 21, textAlign: "center" },
  showcase: {
    padding: 25,
    paddingVertical: 32,
    borderRadius: 36,
    alignItems: "center",
  },
  phone: {
    width: "100%",
    maxWidth: 290,
    padding: 17,
    paddingTop: 12,
    borderWidth: 6,
    borderRadius: 36,
    gap: 18,
  },
  notch: { width: 75, height: 7, borderRadius: 10, alignSelf: "center" },
  phoneBrand: { flexDirection: "row", alignItems: "center", gap: 7 },
  tinyLogo: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  demo: { marginLeft: "auto", fontSize: 10 },
  phoneGreeting: { fontSize: 23, lineHeight: 32, fontWeight: "700" },
  mockCard: { borderRadius: 20, padding: 16, gap: 10 },
  mockTitle: { fontSize: 17, fontWeight: "700" },
  mockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  mockIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mockTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 5,
  },
  features: {
    borderTopWidth: 1,
    paddingTop: 28,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
  },
  feature: { flex: 1, flexBasis: 220, gap: 9 },
});

