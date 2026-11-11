import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ConsultationDoctor } from "./DoctorCard";

export default function VideoCallModal({
  doctor,
  patientName,
  onEnd,
}: {
  doctor: ConsultationDoctor;
  patientName: string;
  onEnd: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [muted, setMuted] = useState(false);
  const [frontCamera, setFrontCamera] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const callScreen = (
    <View
      testID="video-call-overlay"
      style={styles.screen}
      accessibilityViewIsModal
    >
        <View style={styles.video}>
          {doctor.video ? (
            <ImageBackground
              source={doctor.video}
              resizeMode="cover"
              imageStyle={styles.videoImage}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={styles.noVideo}>
              <Feather name="user" size={88} color="#CDE9E3" />
              <Text style={styles.white}>ภาพแพทย์ตัวอย่าง</Text>
            </View>
          )}
          <View style={[styles.top, { paddingTop: Math.max(insets.top, 16) }]}>
            <Text style={styles.demo}>● วิดีโอคอลจำลอง</Text>
            <Text style={styles.heading}>กำลังปรึกษา {doctor.name}</Text>
            <Text style={styles.time}>{time} นาที</Text>
          </View>
          <View style={styles.previewRow}>
            <View
              style={styles.pip}
              accessibilityLabel={`กล้องผู้ป่วยจำลอง ${frontCamera ? "ด้านหน้า" : "ด้านหลัง"}`}
            >
              <Feather
                name={frontCamera ? "user" : "camera"}
                size={32}
                color="#D4EDE7"
              />
              <Text style={styles.pipText}>
                {frontCamera ? "กล้องหน้า" : "กล้องหลัง"} · จำลอง
              </Text>
              <Text numberOfLines={1} style={styles.pipName}>
                {patientName}
              </Text>
            </View>
          </View>
          <View style={styles.videoBottom}>
            <Text style={styles.white}>
              {muted ? "ปิดไมโครโฟนแล้ว" : "เปิดไมโครโฟน"} · ภาพนิ่งสำหรับสาธิต
            </Text>
          </View>
        </View>
        <ScrollView
          style={styles.controlsScroll}
          contentContainerStyle={[
            styles.controls,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Text style={styles.controlsNote}>
            ยังไม่มีการเปิดกล้อง ไมค์ หรือเชื่อมต่อแพทย์จริง
          </Text>
          <View style={styles.controlRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={muted ? "เปิดไมค์" : "ปิดไมค์"}
              accessibilityState={{ selected: muted }}
              onPress={() => setMuted(!muted)}
              style={[styles.utility, muted && styles.selected]}
            >
              <Feather
                name={muted ? "mic-off" : "mic"}
                size={26}
                color="#FFFFFF"
              />
              <Text style={styles.controlText}>
                {muted ? "เปิดไมค์" : "ปิดไมค์"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="วางสาย"
              onPress={onEnd}
              style={({ pressed }) => [styles.end, pressed && { opacity: 0.8 }]}
            >
              <Feather name="phone-off" size={32} color="#FFFFFF" />
              <Text style={styles.endText}>วางสาย</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="สลับกล้อง"
              onPress={() => setFrontCamera(!frontCamera)}
              style={styles.utility}
            >
              <Feather name="refresh-cw" size={26} color="#FFFFFF" />
              <Text style={styles.controlText}>สลับกล้อง</Text>
            </Pressable>
          </View>
        </ScrollView>
    </View>
  );

  // Native Modal fills the device screen. On web, use a fixed viewport layer
  // because React Native Web's Modal can inherit the size of its parent.
  if (Platform.OS === "web") return callScreen;

  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onEnd}
    >
      {callScreen}
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#0B2422",
  },
  video: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: "#174E48",
  },
  videoImage: { width: "100%", height: "100%" },
  noVideo: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  top: { backgroundColor: "rgba(6,28,26,0.78)", padding: 20, gap: 6 },
  demo: { color: "#ACEDDC", fontSize: 13, fontWeight: "700" },
  heading: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 29,
    fontWeight: "700",
  },
  time: { color: "#D5EBE5", fontSize: 16, fontVariant: ["tabular-nums"] },
  previewRow: { alignItems: "flex-end", padding: 16 },
  pip: {
    width: 112,
    minHeight: 136,
    borderRadius: 18,
    backgroundColor: "#153D38",
    borderWidth: 2,
    borderColor: "#E8F8F2",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    gap: 8,
  },
  pipText: { color: "#E6F4F0", fontSize: 11, textAlign: "center" },
  pipName: { color: "#FFFFFF", fontSize: 12, maxWidth: "100%" },
  videoBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: "rgba(6,28,26,0.72)",
  },
  white: { color: "#FFFFFF", fontSize: 14, lineHeight: 22 },
  controlsScroll: { flexGrow: 0, flexShrink: 0, maxHeight: "45%" },
  controls: {
    padding: 16,
    gap: 16,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  controlsNote: {
    color: "#BCD5CE",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 20,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  utility: {
    flex: 1,
    minHeight: 82,
    maxWidth: 110,
    borderRadius: 20,
    backgroundColor: "#254B45",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    gap: 8,
  },
  selected: { backgroundColor: "#744038" },
  controlText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  end: {
    flex: 1.4,
    maxWidth: 180,
    minHeight: 100,
    backgroundColor: "#E33646",
    borderRadius: 26,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  endText: {
    color: "#FFFFFF",
    fontSize: 23,
    lineHeight: 32,
    fontWeight: "800",
  },
});

