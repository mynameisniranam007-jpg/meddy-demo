import React, { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import * as Haptics from "expo-haptics";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import { useColors } from "@/hooks/useColors";
import { useMedtriage } from "@/context/MedtriageContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export default function PassScreen() {
  const colors = useColors();
  const {
    appointment,
    appointmentLoading,
    updateAppointmentRating,
    cancelAppointment,
  } = useMedtriage();
  const [rating, setRating] = useState(appointment?.rating ?? 0);
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const cancelNow = async () => {
    try {
      await cancelAppointment();
      router.replace("/(tabs)");
    } catch {
      if (Platform.OS === "web")
        window.alert("ใช้สิทธิยกเลิกครบ 2 ครั้งต่อวันแล้ว");
      else Alert.alert("ยกเลิกไม่ได้", "ใช้สิทธิยกเลิกครบ 2 ครั้งต่อวันแล้ว");
    }
  };
  const requestCancellation = () => setShowCancelConfirm(true);

  const confirmRating = async () => {
    if (!rating) {
      Alert.alert("เลือกคะแนนก่อน", "แตะดาวเพื่อให้คะแนนบริการตัวอย่าง");
      return;
    }
    setSaving(true);
    try {
      await updateAppointmentRating(rating);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("บันทึกคะแนนไม่ได้", "ลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  if (appointmentLoading) {
    return (
      <Screen>
        <BodyText>กำลังโหลดบัตรคิว…</BodyText>
      </Screen>
    );
  }

  if (!appointment) {
    return (
      <Screen contentStyle={styles.page}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            label="ย้อนกลับ"
            onPress={() => router.back()}
          />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            บัตรคิว
          </Text>
          <View style={{ width: 44 }} />
        </View>
        <SurfaceCard style={styles.emptyCard}>
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}
          >
            <Feather name="grid" size={24} color={colors.secondaryForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            ยังไม่มีบัตรคิว
          </Text>
          <BodyText>เลือกโรงพยาบาลและจองคิวตัวอย่างก่อน</BodyText>
          <PrimaryButton
            title="ค้นหาโรงพยาบาล"
            icon="map-pin"
            onPress={() => router.push("/(tabs)/hospitals")}
          />
        </SurfaceCard>
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
          <Eyebrow>บัตรคิวดิจิทัล</Eyebrow>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            พร้อมสำหรับเช็คอิน
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.demoBanner, { backgroundColor: colors.secondary }]}>
        <Feather name="info" size={15} color={colors.secondaryForeground} />
        <Text style={[styles.demoText, { color: colors.secondaryForeground }]}>
          QR นี้เป็นตัวอย่าง ไม่ใช้ยืนยันนัดหมายที่โรงพยาบาลจริง
        </Text>
      </View>

      <SurfaceCard style={styles.qrCard}>
        <Pill tone="teal">
          {appointment.kind === "checkin"
            ? "คิวเช็คอินตัวอย่าง"
            : "คิวนัดหมายตัวอย่าง"}
        </Pill>
        <Text style={[styles.queueLabel, { color: colors.mutedForeground }]}>
          หมายเลขคิวตัวอย่าง
        </Text>
        <Text style={[styles.queueNumber, { color: colors.foreground }]}>
          {appointment.reference.slice(-4)}
        </Text>
        <View style={styles.qrFrame}>
          <QRCode
            value={`meddy-demo:${appointment.reference}`}
            size={190}
            color="#0D2C54"
            backgroundColor="#FFFFFF"
            ecl="H"
          />
        </View>
        <Text style={[styles.qrCaption, { color: colors.mutedForeground }]}>
          แสดงรหัสตัวอย่างนี้ในแอปเท่านั้น
        </Text>
      </SurfaceCard>

      <SurfaceCard style={styles.appointmentCard}>
        <SectionTitle title="รายละเอียดนัดหมาย" />
        <DetailRow
          icon="map-pin"
          label="สถานพยาบาล"
          value={appointment.hospitalName}
        />
        <DetailRow
          icon="activity"
          label="แผนก"
          value={appointment.department}
        />
        <DetailRow icon="user" label="แพทย์" value={appointment.doctor} />
        <DetailRow
          icon="calendar"
          label="วันที่"
          value={appointment.dateLabel}
        />
        <DetailRow icon="clock" label="เวลา" value={appointment.timeSlot} />
      </SurfaceCard>

      <View style={styles.cancelNotice}>
        <Feather name="alert-circle" size={16} color="#9A5A00" />
        <Text style={styles.cancelText}>
          นัดนี้เป็นตัวอย่าง · หากไม่มาตามนัดจริง
          อาจมีเงื่อนไขหรือค่าธรรมเนียมตามนโยบายสถานพยาบาล
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={requestCancellation}
        style={({ pressed }) => [
          styles.cancelButton,
          { borderColor: colors.destructive, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="x-circle" size={17} color={colors.destructive} />
        <Text style={[styles.cancelButtonText, { color: colors.destructive }]}>
          ยกเลิกการนัดหมาย (ใช้สิทธิได้ 2 ครั้ง/วัน)
        </Text>
      </Pressable>

      <SurfaceCard style={styles.triageCard}>
        <SectionTitle
          title="สรุปข้อมูลส่งตัวเบื้องต้น"
          detail="ข้อมูลตัวอย่างในอุปกรณ์นี้"
        />
        <View style={styles.historyLine}>
          <View
            style={[
              styles.historyBullet,
              { backgroundColor: colors.accentForeground },
            ]}
          />
          <Text style={[styles.historyText, { color: colors.foreground }]}>
            ผู้ป่วย: {appointment.patientName || "ข้อมูลตัวอย่าง"}
          </Text>
        </View>
        <View style={styles.historyLine}>
          <View
            style={[
              styles.historyBullet,
              { backgroundColor: colors.accentForeground },
            ]}
          />
          <Text style={[styles.historyText, { color: colors.foreground }]}>
            ข้อมูลส่งตัวเบื้องต้น: ผลคัดกรองตัวอย่าง ยังไม่ผ่านการวินิจฉัย
          </Text>
        </View>
        <BodyText style={styles.historyDisclaimer}>
          ไม่มีการส่งประวัติสุขภาพไปยังโรงพยาบาลจากต้นแบบนี้
        </BodyText>
      </SurfaceCard>

      <SurfaceCard style={styles.ratingCard}>
        <View style={styles.ratingHeading}>
          <View
            style={[styles.ratingIcon, { backgroundColor: colors.secondary }]}
          >
            <Feather name="star" size={17} color={colors.secondaryForeground} />
          </View>
          <View style={styles.ratingCopy}>
            <Text style={[styles.ratingTitle, { color: colors.foreground }]}>
              ประเมินบริการ
            </Text>
            <Text style={[styles.ratingSub, { color: colors.mutedForeground }]}>
              ให้คะแนนประสบการณ์ตัวอย่าง
            </Text>
          </View>
        </View>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`ให้ ${star} ดาว`}
              accessibilityState={{ selected: rating === star }}
              testID={`rating-star-${star}`}
              onPress={() => setRating(star)}
              hitSlop={5}
              style={({ pressed }) => [
                styles.starButton,
                { opacity: pressed ? 0.65 : 1 },
              ]}
            >
              <Feather
                name={star <= rating ? "star" : "star"}
                size={28}
                color={star <= rating ? "#D49625" : colors.border}
                fill={star <= rating ? "#D49625" : "transparent"}
              />
            </Pressable>
          ))}
        </View>
        {appointment.rating ? (
          <Pill tone="teal">บันทึกแล้ว · {appointment.rating} ดาว</Pill>
        ) : null}
        <PrimaryButton
          title="ยืนยันบริการ"
          icon="check"
          onPress={() => void confirmRating()}
          loading={saving}
          testID="confirm-service-rating"
        />
      </SurfaceCard>
      <ConfirmationDialog
        visible={showCancelConfirm}
        title="ยืนยันยกเลิกนัดหมาย?"
        message="นัดหมายตัวอย่างนี้จะถูกลบออกจากบัตรคิวทันที ใช้สิทธิยกเลิกได้ไม่เกิน 2 ครั้งต่อวัน หากไม่มาตามนัดจริงอาจมีเงื่อนไขตามนโยบายสถานพยาบาล"
        confirmLabel="ยืนยันยกเลิก"
        icon="calendar"
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          void cancelNow();
        }}
      />
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
      <Feather name={icon} size={16} color={colors.secondaryForeground} />
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 17 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: { alignItems: "center", gap: 3 },
  headerTitle: { fontSize: 19, fontWeight: "800" },
  demoBanner: {
    minHeight: 43,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  demoText: { flex: 1, fontSize: 11, lineHeight: 17, fontWeight: "600" },
  qrCard: { alignItems: "center", gap: 9, paddingVertical: 20 },
  queueLabel: { fontSize: 12, marginTop: 3 },
  queueNumber: { fontSize: 32, fontWeight: "900", letterSpacing: 2 },
  qrFrame: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 18,
    marginTop: 5,
  },
  qrCaption: { fontSize: 11, textAlign: "center" },
  appointmentCard: { gap: 12 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderTopWidth: 1,
    paddingTop: 11,
  },
  detailLabel: { width: 62, fontSize: 11 },
  detailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    lineHeight: 18,
  },
  triageCard: { gap: 12 },
  historyLine: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  historyBullet: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  historyText: { flex: 1, fontSize: 12, lineHeight: 19 },
  historyDisclaimer: { fontSize: 10, lineHeight: 16, marginTop: 2 },
  ratingCard: { gap: 13 },
  ratingHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  ratingIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingCopy: { gap: 3 },
  ratingTitle: { fontSize: 14, fontWeight: "800" },
  ratingSub: { fontSize: 11 },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  starButton: {
    minWidth: 39,
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: { alignItems: "center", gap: 13, paddingVertical: 32 },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  cancelNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFF4DE",
    padding: 12,
    borderRadius: 14,
  },
  cancelText: { flex: 1, color: "#805000", fontSize: 11, lineHeight: 17 },
  cancelButton: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButtonText: { fontSize: 12, fontWeight: "800" },
});
