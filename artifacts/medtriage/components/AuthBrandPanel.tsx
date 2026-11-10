import React from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

/** Decorative UI built from native components; no remote image dependency. */
export function AuthBrandPanel({
  compact,
  small = false,
}: {
  compact: boolean;
  small?: boolean;
}) {
  return (
    <View style={[styles.panel, compact ? styles.compact : styles.desktop]}>
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          compact && { width: 180, height: 180, right: -50, bottom: -120 },
        ]}
      />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="กลับหน้าแรก"
        onPress={() => router.replace("/welcome")}
        style={styles.back}
      >
        <Feather name="arrow-left" color="#D0E8E1" size={17} />
        <Text style={styles.backText}>กลับหน้าแรก</Text>
      </Pressable>
      <View
        style={[
          styles.content,
          compact && { gap: 12, alignItems: "flex-start" },
        ]}
      >
        {!small ? (
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>YOUR EVERYDAY HEALTH COMPANION</Text>
          </View>
        ) : null}
        <Text
          style={[
            styles.headline,
            !compact && small && { fontSize: 36, lineHeight: 48 },
            compact && {
              fontSize: small ? 24 : 30,
              lineHeight: small ? 34 : 42,
              textAlign: "left",
            },
          ]}
        >
          ดูแลสุขภาพ{compact ? " " : "\n"}
          <Text style={{ color: "#B7E4D0" }}>ให้ง่ายขึ้นทุกวัน</Text>
        </Text>
        {!compact && !small ? (
          <Text style={styles.description}>
            เริ่มต้นดูแลตัวเอง และคนที่คุณรัก{"\n"}ด้วยขั้นตอนที่เข้าใจง่าย
            ใกล้คุณมากขึ้น
          </Text>
        ) : null}
        {!compact ? (
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.phoneStage,
              small && { height: 310, transform: [{ scale: 0.82 }] },
            ]}
          >
            <View style={styles.orbit} />
            <View style={styles.phone}>
              <View style={styles.notch} />
              <View style={styles.phoneBrand}>
                <View style={styles.plus}>
                  <Feather name="plus" color="#FFF" size={18} />
                </View>
                <Text style={styles.phoneBrandText}>Meddy</Text>
                <Feather name="bell" color="#607970" size={17} />
              </View>
              <Text style={styles.phoneGreeting}>สวัสดี, คุณสมศรี</Text>
              <Text style={styles.phoneSub}>วันนี้ให้เราช่วยดูแลคุณ</Text>
              <View style={styles.healthCard}>
                <View style={styles.healthIcon}>
                  <Feather name="activity" size={22} color="#FFF" />
                </View>
                <Text style={styles.healthTitle}>รู้สึกไม่สบายตรงไหน?</Text>
                <Text style={styles.healthDetail}>
                  เริ่มคัดกรองอาการเบื้องต้น
                </Text>
                <View style={styles.healthAction}>
                  <Text style={styles.healthActionText}>ประเมินอาการ</Text>
                  <Feather name="arrow-right" color="#0D4744" size={15} />
                </View>
              </View>
              <View style={styles.phoneRow}>
                <View style={styles.rowIcon}>
                  <Feather name="map-pin" size={18} color="#176B68" />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.rowTitle}>โรงพยาบาลใกล้คุณ</Text>
                  <Text style={styles.rowDetail}>เลือกการดูแลที่เหมาะสม</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#607970" />
              </View>
              <View style={styles.phoneTabs}>
                {["home", "plus-square", "book-open", "user"].map((icon) => (
                  <Feather
                    key={icon}
                    name={icon as "home"}
                    size={18}
                    color={icon === "home" ? "#176B68" : "#9BAAA5"}
                  />
                ))}
              </View>
            </View>
            <View style={styles.floatingCard}>
              <View style={styles.floatIcon}>
                <Feather name="heart" size={20} color="#176B68" />
              </View>
              <View>
                <Text style={styles.floatTitle}>ดูแลคนที่คุณรัก</Text>
                <Text style={styles.floatDetail}>
                  โปรไฟล์สุขภาพสำหรับครอบครัว
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
      {!compact ? (
        <View style={styles.bottom}>
          <Feather name="heart" size={14} color="#B7E4D0" />
          <Text style={styles.bottomText}>Made for a healthier everyday.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#0D4744",
    overflow: "hidden",
    position: "relative",
  },
  desktop: {
    width: "50%",
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  compact: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 18,
  },
  back: {
    minHeight: 40,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  backText: { color: "#D0E8E1", fontSize: 13 },
  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    alignItems: "center",
    gap: 18,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#B7E4D0" },
  badgeText: {
    fontSize: 10,
    letterSpacing: 1.1,
    color: "#C1DFD3",
    fontWeight: "600",
    flexShrink: 1,
  },
  headline: {
    fontSize: 42,
    lineHeight: 58,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    color: "#BFD8D1",
    textAlign: "center",
  },
  glow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: "#155A53",
    right: -240,
    bottom: -160,
  },
  phoneStage: {
    width: "100%",
    height: 396,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  orbit: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: "rgba(200,238,220,0.12)",
  },
  phone: {
    width: 226,
    padding: 15,
    borderWidth: 5,
    borderColor: "#B0CDC2",
    backgroundColor: "#F7FBF9",
    borderRadius: 32,
    transform: [{ rotate: "-7deg" }],
    gap: 13,
    shadowColor: "#001B16",
    shadowOpacity: 0.35,
    shadowOffset: { width: 12, height: 18 },
    shadowRadius: 25,
    elevation: 12,
  },
  notch: {
    width: 62,
    height: 6,
    backgroundColor: "#123E39",
    borderRadius: 8,
    alignSelf: "center",
    marginTop: -3,
    marginBottom: 5,
  },
  phoneBrand: { flexDirection: "row", gap: 6, alignItems: "center" },
  plus: {
    width: 27,
    height: 27,
    backgroundColor: "#176B68",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneBrandText: {
    flex: 1,
    fontWeight: "800",
    color: "#123E39",
    fontSize: 16,
  },
  phoneGreeting: {
    fontSize: 17,
    fontWeight: "700",
    color: "#123E39",
    marginTop: 4,
  },
  phoneSub: { fontSize: 11, color: "#6A8077", marginTop: -9 },
  healthCard: {
    backgroundColor: "#176B68",
    borderRadius: 18,
    padding: 13,
    gap: 8,
  },
  healthIcon: {
    padding: 6,
    backgroundColor: "rgba(255,255,255,.12)",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  healthTitle: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  healthDetail: { color: "#D1E8E1", fontSize: 10 },
  healthAction: {
    marginTop: 4,
    backgroundColor: "#F2FAF5",
    padding: 9,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthActionText: { color: "#0D4744", fontSize: 11, fontWeight: "700" },
  phoneRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    paddingVertical: 6,
  },
  rowIcon: { padding: 7, backgroundColor: "#E7F3ED", borderRadius: 10 },
  rowTitle: { fontSize: 11, color: "#123E39", fontWeight: "700" },
  rowDetail: { fontSize: 9, color: "#6A8077" },
  phoneTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E1EAE5",
    paddingTop: 11,
    paddingBottom: 3,
  },
  floatingCard: {
    position: "absolute",
    bottom: 22,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#001B16",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  floatIcon: { padding: 9, borderRadius: 12, backgroundColor: "#E7F3ED" },
  floatTitle: { fontSize: 12, fontWeight: "700", color: "#123E39" },
  floatDetail: { fontSize: 10, color: "#6A8077", marginTop: 4 },
  bottom: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  bottomText: { color: "#BFD8D1", fontSize: 11 },
});

