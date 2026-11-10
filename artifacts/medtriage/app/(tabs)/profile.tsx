import React, { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
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
  Pill,
  PrimaryButton,
  Screen,
  SectionTitle,
  SurfaceCard,
} from "@/components/UI";
import PatientProfileSection from "@/components/PatientProfileSection";
import { useColors } from "@/hooks/useColors";
import { useMedtriage } from "@/context/MedtriageContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import FamilyProfiles from "@/components/FamilyProfiles";
import { enableBiometrics } from "@/utils/biometrics";

export default function ProfileScreen() {
  const colors = useColors();
  const {
    appointment,
    appointmentLoading,
    logout,
    session,
    activePatient,
    requestAuth,
    storageError,
  } = useMedtriage();
  const [bioMessage, setBioMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const performLogout = async () => {
    try {
      await logout();
      router.dismissAll();
      router.replace("/");
    } catch {
      if (Platform.OS === "web")
        window.alert("ลบข้อมูลไม่สำเร็จ กรุณาลองออกจากระบบอีกครั้ง");
      else Alert.alert("ลบข้อมูลไม่สำเร็จ", "กรุณาลองออกจากระบบอีกครั้ง");
    }
  };
  const requestLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.heading}>
        <Eyebrow>พื้นที่ของคุณ</Eyebrow>
        <Text style={[styles.title, { color: colors.foreground }]}>
          โปรไฟล์ของฉัน
        </Text>
      </View>

      <SurfaceCard style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Feather name="user" size={25} color={colors.accentForeground} />
        </View>
        <View style={styles.profileCopy}>
          <Pill tone="neutral">บัญชีตัวอย่าง</Pill>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {activePatient?.profile.fullName || "ข้อมูลส่วนตัวและสุขภาพ"}
          </Text>
          <Text style={[styles.profileSub, { color: colors.mutedForeground }]}>
            บันทึกไว้ในอุปกรณ์นี้เท่านั้น
          </Text>
        </View>
      </SurfaceCard>

      <View
        style={[styles.privacyBanner, { backgroundColor: colors.secondary }]}
      >
        <Feather name="shield" size={16} color={colors.secondaryForeground} />
        <Text
          style={[styles.privacyText, { color: colors.secondaryForeground }]}
        >
          ข้อมูลโปรไฟล์เก็บไว้ในเครื่องเพื่อทดลองเท่านั้น ยังไม่เชื่อม ThaID
          หรือระบบจัดเก็บที่ปลอดภัย
        </Text>
      </View>

      <SectionTitle
        title="ประวัติส่วนตัว"
        detail="ข้อมูลพื้นฐานที่ใช้เตรียมก่อนพบแพทย์"
      />
      {storageError ? <BodyText>{storageError}</BodyText> : null}
      {session ? (
        <>
          <FamilyProfiles />
          <PatientProfileSection key={activePatient?.id} mode="profile" />
          <PrimaryButton
            title="เปิด Face ID / Touch ID สำหรับครั้งถัดไป"
            onPress={() => {
              void enableBiometrics(session)
                .then(() => setBioMessage("เปิดใช้งานแล้ว"))
                .catch((e) =>
                  setBioMessage(
                    e instanceof Error ? e.message : "เปิดใช้งานไม่ได้",
                  ),
                );
            }}
          />
          {bioMessage ? <BodyText>{bioMessage}</BodyText> : null}
        </>
      ) : (
        <PrimaryButton
          title="เข้าสู่ระบบเพื่อเพิ่มข้อมูลและบัญชีครอบครัว"
          onPress={() => requestAuth("/(tabs)/profile")}
        />
      )}

      <SectionTitle title="นัดหมายของฉัน" />
      {appointmentLoading ? (
        <SurfaceCard>
          <BodyText>กำลังโหลดนัดหมาย…</BodyText>
        </SurfaceCard>
      ) : appointment ? (
        <SurfaceCard style={styles.appointmentCard}>
          <View style={styles.appointmentTop}>
            <View
              style={[
                styles.appointmentIcon,
                { backgroundColor: colors.accent },
              ]}
            >
              <Feather
                name="calendar"
                size={19}
                color={colors.accentForeground}
              />
            </View>
            <Pill tone="teal">
              {appointment.kind === "checkin" ? "เช็คอิน" : "จองล่วงหน้า"}
            </Pill>
          </View>
          <Text style={[styles.hospitalName, { color: colors.foreground }]}>
            {appointment.hospitalName}
          </Text>
          <Text
            style={[
              styles.appointmentDetail,
              { color: colors.mutedForeground },
            ]}
          >
            {appointment.department} · {appointment.doctor}
          </Text>
          <Text style={[styles.appointmentTime, { color: colors.foreground }]}>
            {appointment.dateLabel} · {appointment.timeSlot}
          </Text>
          <PrimaryButton
            title="เปิดบัตรคิว QR"
            icon="grid"
            onPress={() => router.push("/pass")}
            testID="open-profile-pass"
          />
        </SurfaceCard>
      ) : (
        <SurfaceCard style={styles.emptyCard}>
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}
          >
            <Feather
              name="calendar"
              size={20}
              color={colors.secondaryForeground}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            ยังไม่มีนัดหมาย
          </Text>
          <BodyText style={styles.emptyText}>
            เลือกสถานพยาบาลและช่วงเวลาที่สะดวกเพื่อจองคิวตัวอย่าง
          </BodyText>
          <PrimaryButton
            title="ค้นหาโรงพยาบาล"
            icon="map-pin"
            onPress={() => router.push("/(tabs)/hospitals")}
          />
        </SurfaceCard>
      )}

      <SectionTitle title="บัญชีและความช่วยเหลือ" />
      <View style={styles.menuList}>
        <ProfileRow
          icon="user-check"
          title="ยืนยันตัวตนด้วย ThaID"
          detail="ยังไม่เชื่อมต่อในเวอร์ชันทดลอง"
          onPress={() =>
            Alert.alert(
              "ThaID · ตัวอย่าง",
              "การยืนยันตัวตนยังไม่เปิดใช้งานในต้นแบบนี้",
            )
          }
        />
        <ProfileRow
          icon="help-circle"
          title="เกี่ยวกับ Meddy"
          detail="แอปต้นแบบสำหรับการประเมินเบื้องต้น"
          onPress={() =>
            Alert.alert(
              "เกี่ยวกับ Meddy",
              "ตัวอย่าง UX สำหรับการดูแลสุขภาพ ไม่ใช่บริการทางการแพทย์จริง",
            )
          }
        />
        <ProfileRow
          icon="settings"
          title="การตั้งค่า"
          detail="เลือกโหมดสว่าง มืด หรือตามระบบ"
          onPress={() => router.push("/settings")}
        />
      </View>

      <BodyText style={styles.footerNote}>
        หากต้องการบริการสุขภาพจริง โปรดติดต่อสถานพยาบาลโดยตรง
      </BodyText>
      <PrimaryButton
        title="ออกจากระบบ"
        icon="log-out"
        onPress={requestLogout}
        testID="logout-button"
      />
      <ConfirmationDialog
        visible={showLogoutConfirm}
        title="ออกจากระบบและลบข้อมูล?"
        message="แอปทดลองนี้จะลบโปรไฟล์สุขภาพ ประวัติอาการ และนัดหมายออกจากอุปกรณ์ แล้วกลับไปหน้าแรก บัญชีทดลองยังใช้เข้าสู่ระบบครั้งต่อไปได้"
        confirmLabel="ลบข้อมูลและออก"
        icon="log-out"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          void performLogout();
        }}
      />
    </Screen>
  );
}

function ProfileRow({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  detail: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={17} color={colors.secondaryForeground} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.menuDetail, { color: colors.mutedForeground }]}>
          {detail}
        </Text>
      </View>
      <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { gap: 18 },
  heading: { gap: 5 },
  title: { fontSize: 25, fontWeight: "800" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 19,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCopy: { gap: 5, flex: 1, minWidth: 0 },
  name: { fontSize: 19, fontWeight: "800" },
  profileSub: { fontSize: 12 },
  privacyBanner: {
    minHeight: 43,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  privacyText: { flex: 1, fontSize: 11, lineHeight: 17, fontWeight: "600" },
  appointmentCard: { gap: 11 },
  appointmentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appointmentIcon: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalName: { fontSize: 15, lineHeight: 22, fontWeight: "800" },
  appointmentDetail: { fontSize: 11, lineHeight: 17 },
  appointmentTime: { fontSize: 13, fontWeight: "700" },
  emptyCard: { alignItems: "flex-start" },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 15, fontWeight: "800" },
  emptyText: { fontSize: 12, lineHeight: 19 },
  menuList: { backgroundColor: "transparent" },
  menuRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: { flex: 1, gap: 3 },
  menuTitle: { fontSize: 13, fontWeight: "700" },
  menuDetail: { fontSize: 11 },
  footerNote: { textAlign: "center", fontSize: 11, lineHeight: 17 },
});
