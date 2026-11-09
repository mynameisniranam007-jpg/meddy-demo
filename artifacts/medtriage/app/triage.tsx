import React, { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useMedtriage } from "@/context/MedtriageContext";
import {
  BodyText,
  Eyebrow,
  IconButton,
  Pill,
  PrimaryButton,
  Screen,
  SectionTitle,
  SurfaceCard,
} from "@/components/UI";

const bodyLocations = [
  "ศีรษะ",
  "คอ",
  "หน้าอก",
  "ท้อง",
  "หลัง",
  "แขน/มือ",
  "ขา/เท้า",
];

export default function TriageScreen() {
  const colors = useColors();
  const {
    symptoms,
    setSymptoms,
    bodyParts,
    toggleBodyPart,
    photoUri,
    setPhotoUri,
    beginTriageSession,
  } = useMedtriage();
  const [busy, setBusy] = useState(false);
  const [otherLocation, setOtherLocation] = useState("");

  const pickPhoto = async (source: "camera" | "library") => {
    try {
      setBusy(true);
      let result: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        if (Platform.OS !== "web") {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "ต้องการสิทธิ์กล้อง",
              permission.canAskAgain
                ? "อนุญาตให้ใช้กล้องเพื่อถ่ายภาพอาการ"
                : "เปิดการตั้งค่าของอุปกรณ์เพื่ออนุญาตการใช้กล้อง",
            );
            return;
          }
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.75,
          base64: true,
        });
      } else {
        if (Platform.OS !== "web") {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "ต้องการสิทธิ์คลังรูปภาพ",
              permission.canAskAgain
                ? "อนุญาตให้เลือกรูปภาพเพื่อแนบในตัวอย่างนี้"
                : "เปิดการตั้งค่าของอุปกรณ์เพื่ออนุญาตการใช้รูปภาพ",
            );
            return;
          }
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.75,
        });
      }
      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(
          result.assets[0].base64
            ? `data:${result.assets[0].mimeType ?? "image/jpeg"};base64,${result.assets[0].base64}`
            : result.assets[0].uri,
        );
      }
    } catch {
      Alert.alert(
        "ไม่สามารถเลือกรูปภาพได้",
        "ลองอีกครั้งหรือเลือกภาพจากคลังรูป",
      );
    } finally {
      setBusy(false);
    }
  };

  const runDemoAssessment = () => {
    if (!symptoms.trim() && bodyParts.length === 0 && !photoUri) {
      Alert.alert(
        "เพิ่มข้อมูลอาการก่อน",
        "พิมพ์อาการ เลือกตำแหน่ง หรือแนบภาพตัวอย่าง",
      );
      return;
    }
    if (bodyParts.includes("อื่นๆ") && !otherLocation.trim()) {
      Alert.alert("ระบุตำแหน่งเพิ่มเติม", "พิมพ์ว่าปวดหรือไม่สบายบริเวณใด");
      return;
    }
    if (bodyParts.includes("อื่นๆ") && otherLocation.trim()) {
      setSymptoms(
        [
          symptoms.replace(/\n?ตำแหน่งอื่น:.*$/s, "").trim(),
          `ตำแหน่งอื่น: ${otherLocation.trim()}`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
    const assessmentSymptoms =
      bodyParts.includes("อื่นๆ") && otherLocation.trim()
        ? [
            symptoms.replace(/\n?ตำแหน่งอื่น:.*$/s, "").trim(),
            "ตำแหน่งอื่น: " + otherLocation.trim(),
          ]
            .filter(Boolean)
            .join("\n")
        : symptoms.trim();
    beginTriageSession(assessmentSymptoms);
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/results");
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
          <Eyebrow>ขั้นตอน 1 จาก 2</Eyebrow>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            ประเมินอาการเบื้องต้น
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.demoBanner, { backgroundColor: colors.secondary }]}>
        <Feather name="info" size={16} color={colors.secondaryForeground} />
        <Text style={[styles.demoText, { color: colors.secondaryForeground }]}>
          โหมดตัวอย่าง: ไม่มีการวิเคราะห์อาการหรือภาพจริง
        </Text>
      </View>

      <SurfaceCard style={styles.formCard}>
        <View style={styles.assistantRow}>
          <View
            style={[styles.assistantIcon, { backgroundColor: colors.primary }]}
          >
            <Feather
              name="activity"
              size={17}
              color={colors.primaryForeground}
            />
          </View>
          <View style={styles.assistantCopy}>
            <Text style={[styles.assistantName, { color: colors.foreground }]}>
              ผู้ช่วยคัดกรอง
            </Text>
            <Text
              style={[styles.assistantSub, { color: colors.mutedForeground }]}
            >
              เล่าอาการที่รู้สึกได้เลย
            </Text>
          </View>
          <Pill tone="teal">ตัวอย่าง</Pill>
        </View>
        <TextInput
          value={symptoms}
          onChangeText={setSymptoms}
          multiline
          placeholder="ไอ มีไข้มา 2 วัน ปวดหัว"
          placeholderTextColor={colors.mutedForeground}
          testID="triage-symptom-input"
          style={[
            styles.symptomInput,
            {
              borderColor: colors.input,
              color: colors.foreground,
              backgroundColor: colors.background,
            },
          ]}
          textAlignVertical="top"
          returnKeyType="default"
        />
        <BodyText style={styles.privacyText}>
          อาการที่พิมพ์จะไม่ถูกส่งไปประเมินจริงหรือบันทึกในบัญชี
        </BodyText>
      </SurfaceCard>

      <View style={styles.sectionBlock}>
        <SectionTitle
          title="ปวดหรือไม่สบายตรงไหน?"
          detail="แตะเลือกได้มากกว่าหนึ่งตำแหน่ง"
        />
        <View style={styles.bodyGrid}>
          {[...bodyLocations, "อื่นๆ"].map((location) => {
            const selected = bodyParts.includes(location);
            return (
              <Pressable
                key={location}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                testID={`body-part-${location}`}
                onPress={() => {
                  Haptics.selectionAsync();
                  toggleBodyPart(location);
                }}
                style={({ pressed }) => [
                  styles.bodyChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: pressed ? 0.78 : 1,
                  },
                ]}
              >
                {selected ? (
                  <Feather
                    name="check"
                    size={14}
                    color={colors.primaryForeground}
                  />
                ) : null}
                <Text
                  style={[
                    styles.bodyChipText,
                    {
                      color: selected
                        ? colors.primaryForeground
                        : colors.foreground,
                    },
                  ]}
                >
                  {location}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {bodyParts.includes("อื่นๆ") ? (
          <TextInput
            value={otherLocation}
            onChangeText={setOtherLocation}
            placeholder="ระบุตำแหน่งที่ไม่สบาย"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.symptomInput,
              {
                minHeight: 48,
                borderColor: colors.input,
                color: colors.foreground,
                backgroundColor: colors.background,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.sectionBlock}>
        <SectionTitle
          title="แนบภาพอาการภายนอก"
          detail="เช่น ผื่น แผล หรืออาการตาแดง"
        />
        {photoUri ? (
          <SurfaceCard style={styles.previewCard}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <View style={styles.photoCopy}>
              <Text style={[styles.photoTitle, { color: colors.foreground }]}>
                ภาพพร้อมสำหรับตัวอย่าง
              </Text>
              <Text
                style={[styles.photoNote, { color: colors.mutedForeground }]}
              >
                ยังไม่มีการวิเคราะห์ภาพ
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPhotoUri(null)}
                style={styles.removePhoto}
              >
                <Feather name="trash-2" size={14} color={colors.destructive} />
                <Text
                  style={[
                    styles.removePhotoText,
                    { color: colors.destructive },
                  ]}
                >
                  ลบภาพ
                </Text>
              </Pressable>
            </View>
          </SurfaceCard>
        ) : (
          <View style={styles.photoActions}>
            <Pressable
              accessibilityRole="button"
              testID="take-symptom-photo"
              onPress={() => pickPhoto("camera")}
              style={({ pressed }) => [
                styles.photoButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.photoActionIcon,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather
                  name="camera"
                  size={19}
                  color={colors.secondaryForeground}
                />
              </View>
              <Text
                style={[styles.photoButtonTitle, { color: colors.foreground }]}
              >
                ถ่ายภาพ
              </Text>
              <Text
                style={[
                  styles.photoButtonSub,
                  { color: colors.mutedForeground },
                ]}
              >
                ใช้กล้อง
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              testID="choose-symptom-photo"
              onPress={() => pickPhoto("library")}
              style={({ pressed }) => [
                styles.photoButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.photoActionIcon,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather
                  name="image"
                  size={19}
                  color={colors.secondaryForeground}
                />
              </View>
              <Text
                style={[styles.photoButtonTitle, { color: colors.foreground }]}
              >
                เลือกรูป
              </Text>
              <Text
                style={[
                  styles.photoButtonSub,
                  { color: colors.mutedForeground },
                ]}
              >
                จากคลังรูปภาพ
              </Text>
            </Pressable>
          </View>
        )}
        <Text style={[styles.photoPrivacy, { color: colors.mutedForeground }]}>
          เลือกรูปแล้ว ภาพจะอยู่ในหน้าจอตัวอย่างนี้เท่านั้น
        </Text>
      </View>

      <PrimaryButton
        title="ดูสรุปผลตัวอย่าง"
        icon="arrow-right"
        loading={busy}
        onPress={runDemoAssessment}
        testID="run-demo-assessment"
      />
      <View style={styles.disclaimer}>
        <Feather name="alert-circle" size={15} color={colors.mutedForeground} />
        <BodyText style={styles.disclaimerText}>
          ผลลัพธ์เป็นตัวอย่างประกอบการออกแบบ ไม่ใช่คำแนะนำทางการแพทย์
        </BodyText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 19 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 7,
  },
  headerCopy: { flex: 1, alignItems: "center", gap: 3 },
  headerTitle: { fontSize: 19, fontWeight: "800", textAlign: "center" },
  demoBanner: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  demoText: { fontSize: 12, lineHeight: 18, fontWeight: "600", flex: 1 },
  formCard: { gap: 13 },
  assistantRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  assistantIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantCopy: { flex: 1, gap: 2 },
  assistantName: { fontSize: 14, fontWeight: "700" },
  assistantSub: { fontSize: 12 },
  symptomInput: {
    borderWidth: 1,
    borderRadius: 15,
    minHeight: 125,
    padding: 14,
    fontSize: 14,
    lineHeight: 22,
  },
  privacyText: { fontSize: 11, lineHeight: 17 },
  sectionBlock: { gap: 12 },
  bodyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  bodyChip: {
    minHeight: 43,
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bodyChipText: { fontSize: 13, fontWeight: "600" },
  photoActions: { flexDirection: "row", gap: 11 },
  photoButton: {
    flex: 1,
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 5,
  },
  photoActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  photoButtonTitle: { fontSize: 13, fontWeight: "700" },
  photoButtonSub: { fontSize: 11 },
  photoPrivacy: { fontSize: 11, lineHeight: 17 },
  previewCard: { flexDirection: "row", alignItems: "center", gap: 13 },
  photoPreview: {
    width: 76,
    height: 76,
    borderRadius: 15,
    backgroundColor: "#E5EEF1",
  },
  photoCopy: { flex: 1, gap: 5 },
  photoTitle: { fontSize: 13, fontWeight: "700" },
  photoNote: { fontSize: 12 },
  removePhoto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  removePhotoText: { fontSize: 12, fontWeight: "700" },
  disclaimer: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  disclaimerText: { flex: 1, fontSize: 11, lineHeight: 17 },
});
