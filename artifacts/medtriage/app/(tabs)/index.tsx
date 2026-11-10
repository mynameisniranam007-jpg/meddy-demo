import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  BodyText,
  Eyebrow,
  IconButton,
  Screen,
  SectionTitle,
  PrimaryButton,
} from "@/components/UI";
import { useColors } from "@/hooks/useColors";
import { useMedtriage } from "@/context/MedtriageContext";
import { healthNews } from "@/constants/news";
import { PatientProfile, PROFILE_STORAGE_KEY } from "@/constants/profile";

export default function HomeScreen() {
  const colors = useColors();
  const {
    appointment,
    activePatient,
    pendingDestination,
    resumeAfterAuth,
    pendingTriageSession,
  } = useMedtriage();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const patientName =
    activePatient?.profile.firstName ||
    activePatient?.profile.fullName ||
    "ผู้ใช้ทั่วไป";
  const weekday = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
  }).format(new Date());

  useEffect(() => {
    if (!appointment) return;
    setNotificationsRead(false);
    setToastMessage("ใกล้ถึงคิวของคุณแล้ว · ตรวจสอบรายละเอียดนัดหมาย");
    const timer = setTimeout(() => setToastMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [appointment?.reference]);

  const goToTriage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/triage");
  };

  const queueNotifications = appointment
    ? [
        {
          id: "five-minutes",
          title: "อีก 5 นาทีจะถึงคิวของคุณ กรุณาเตรียมตัว",
          detail: `${appointment.hospitalName} · ${appointment.timeSlot}`,
        },
        {
          id: "near-turn",
          title: "ใกล้ถึงคิวของคุณแล้ว",
          detail: "โปรดอยู่บริเวณจุดให้บริการและเตรียมบัตรคิวตัวอย่าง",
        },
      ]
    : [];
  const displayedNotifications = appointment
    ? queueNotifications
    : [
        {
          id: "health-news",
          title: "มีข่าวสุขภาพใหม่ให้ติดตาม",
          detail: "แตะเพื่ออ่านข่าวสารสุขภาพจากแหล่งทางการ",
        },
      ];
  const unreadCount = notificationsRead ? 0 : displayedNotifications.length;

  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
            <Feather name="plus" color={colors.primaryForeground} size={21} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              Meddy
            </Text>
            <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>
              ดูแลสุขภาพอย่างเข้าใจ
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.notificationButtonWrap}>
            <IconButton
              icon="bell"
              label="การแจ้งเตือน"
              onPress={() => {
                setNotificationsOpen(true);
                setNotificationsRead(true);
              }}
            />
            {unreadCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ไปหน้าโปรไฟล์"
            testID="home-profile-button"
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed }) => [
              styles.profileButton,
              { backgroundColor: colors.accent, opacity: pressed ? 0.68 : 1 },
            ]}
          >
            <Feather name="user" size={19} color={colors.accentForeground} />
          </Pressable>
        </View>
      </View>

      {toastMessage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ปิดการแจ้งเตือนตัวอย่าง"
          onPress={() => setToastMessage("")}
          style={[styles.toast, { backgroundColor: colors.secondary }]}
        >
          <Feather name="bell" size={16} color={colors.secondaryForeground} />
          <Text
            style={[styles.toastText, { color: colors.secondaryForeground }]}
          >
            {toastMessage}
          </Text>
          <Feather name="x" size={15} color={colors.secondaryForeground} />
        </Pressable>
      ) : null}

      <View style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Eyebrow>{weekday} · พร้อมดูแลคุณ</Eyebrow>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            style={[styles.greeting, { color: colors.foreground }]}
          >
            สวัสดี, {patientName}
          </Text>
        </View>
      </View>

      {pendingDestination ? (
        <View style={{ gap: 10 }}>
          <SectionTitle
            title="รายการที่คุณเลือกไว้"
            detail={
              pendingTriageSession?.symptoms ||
              "กลับไปดำเนินการต่อได้เมื่อพร้อม"
            }
          />
          <PrimaryButton
            title="ดำเนินการต่อจากที่เลือกไว้"
            icon="arrow-right"
            onPress={resumeAfterAuth}
          />
        </View>
      ) : null}
      <View style={styles.newsPreviewSection}>
        <SectionTitle
          title="ตัวอย่างข่าว"
          detail="แตะการ์ดเพื่อดูข่าวสารเพิ่มเติม"
        />
        <View style={styles.newsPreviewList}>
          {healthNews.slice(0, 3).map((article) => (
            <Pressable
              key={article.id}
              accessibilityRole="button"
              accessibilityLabel={`เปิดข่าว ${article.title}`}
              testID={`home-news-${article.id}`}
              onPress={() => router.push("/(tabs)/news")}
              style={({ pressed }) => [
                styles.newsPreviewCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <Image
                source={{ uri: article.imageUrl }}
                contentFit="cover"
                style={styles.newsPreviewImage}
              />
              <View style={styles.newsPreviewCopy}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.newsPreviewTitle,
                    { color: colors.foreground },
                  ]}
                >
                  {article.title}
                </Text>
                <Text
                  style={[
                    styles.newsPreviewMeta,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {article.source} · {article.date}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={17}
                color={colors.mutedForeground}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {appointment ? (
        <View style={styles.appointmentSection}>
          <SectionTitle
            title="นัดหมาย"
            detail="แตะเพื่อดูบัตรคิวและรายละเอียด"
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/pass")}
            style={({ pressed }) => [
              styles.appointmentCard,
              { backgroundColor: colors.secondary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View
              style={[styles.appointmentIcon, { backgroundColor: colors.card }]}
            >
              <Feather
                name="calendar"
                size={19}
                color={colors.secondaryForeground}
              />
            </View>
            <View style={styles.appointmentCopy}>
              <Text
                style={[styles.appointmentTitle, { color: colors.foreground }]}
              >
                {appointment.hospitalName}
              </Text>
              <Text
                style={[
                  styles.appointmentSub,
                  { color: colors.mutedForeground },
                ]}
              >
                {appointment.dateLabel} · {appointment.timeSlot}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>
      ) : null}

      <SectionTitle title="บริการของเรา" detail="เลือกวิธีดูแลที่เหมาะกับคุณ" />
      <View style={styles.actionGrid}>
        <Pressable
          testID="symptom-checker-card"
          accessibilityRole="button"
          onPress={goToTriage}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <View style={styles.actionIcon}>
            <Feather name="activity" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionTitle}>ประเมินอาการ</Text>
          <Text style={styles.actionSub}>คัดกรองเบื้องต้น</Text>
          <Feather
            name="arrow-up-right"
            size={16}
            color="rgba(255,255,255,0.8)"
          />
        </Pressable>
        <Pressable
          testID="telemedicine-card"
          accessibilityRole="button"
          onPress={() => router.push("/telemedicine")}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: "#187C73", opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Feather name="video" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionTitle}>ปรึกษาแพทย์</Text>
          <Text style={styles.actionSub}>พบแพทย์ทางไกล</Text>
          <Feather
            name="arrow-up-right"
            size={16}
            color="rgba(255,255,255,0.8)"
          />
        </Pressable>
      </View>

      <View style={[styles.disclaimer, { borderColor: colors.border }]}>
        <Feather name="shield" size={15} color={colors.mutedForeground} />
        <BodyText style={styles.disclaimerText}>
          Meddy เวอร์ชันทดลอง — ไม่ใช่บริการวินิจฉัยหรือให้การรักษา
        </BodyText>
      </View>

      <Modal
        visible={notificationsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setNotificationsOpen(false)}
          />
          <View
            style={[styles.notificationPanel, { backgroundColor: colors.card }]}
          >
            <View style={styles.notificationPanelHeader}>
              <View style={styles.notificationHeading}>
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Feather
                    name="bell"
                    size={17}
                    color={colors.secondaryForeground}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.notificationTitle,
                      { color: colors.foreground },
                    ]}
                  >
                    การแจ้งเตือน
                  </Text>
                  <Text
                    style={[
                      styles.notificationSub,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {appointment
                      ? "ตัวอย่างแจ้งเตือนคิว"
                      : "ยังไม่มีนัดหมายที่ต้องแจ้งเตือน"}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="ปิด"
                onPress={() => setNotificationsOpen(false)}
                hitSlop={10}
              >
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            {displayedNotifications.length ? (
              displayedNotifications.map((notification) => (
                <View
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    { borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.notificationDot,
                      { backgroundColor: colors.destructive },
                    ]}
                  />
                  <View style={styles.notificationItemCopy}>
                    <Text
                      style={[
                        styles.notificationItemTitle,
                        { color: colors.foreground },
                      ]}
                    >
                      {notification.title}
                    </Text>
                    <Text
                      style={[
                        styles.notificationItemSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {notification.detail}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View
                style={[
                  styles.notificationEmpty,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text
                  style={[
                    styles.notificationEmptyText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  จองคิวตัวอย่างเพื่อทดลองรับการแจ้งเตือน
                </Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              testID="test-queue-notification"
              onPress={() => {
                setNotificationsOpen(false);
                setToastMessage(
                  appointment
                    ? "อีก 5 นาทีจะถึงคิวของคุณ กรุณาเตรียมตัว"
                    : "ยังไม่มีนัดหมายตัวอย่างให้แจ้งเตือน",
                );
                setTimeout(() => setToastMessage(""), 5000);
              }}
              style={({ pressed }) => [
                styles.testNotificationButton,
                {
                  backgroundColor: colors.secondary,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Feather
                name="bell"
                size={15}
                color={colors.secondaryForeground}
              />
              <Text
                style={[
                  styles.testNotificationText,
                  { color: colors.secondaryForeground },
                ]}
              >
                ทดสอบการแจ้งเตือนคิว
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 20 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: { alignItems: "center", gap: 5 },
  notificationButtonWrap: { position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: 1,
    right: 0,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#D94B45",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  brandCopy: { flexShrink: 1, minWidth: 0 },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  brandSub: { fontSize: 10, marginTop: 1 },
  greetingRow: { flexDirection: "row", alignItems: "center", minWidth: 0 },
  greetingCopy: { gap: 6, flex: 1, minWidth: 0 },
  greeting: { fontSize: 24, fontWeight: "800", lineHeight: 32, flexShrink: 1 },
  toast: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toastText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: "700" },
  newsPreviewSection: { gap: 11 },
  newsPreviewList: { gap: 9 },
  newsPreviewCard: {
    minHeight: 82,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
  },
  newsPreviewImage: {
    width: 67,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#D9E8ED",
  },
  newsPreviewCopy: { flex: 1, gap: 5 },
  newsPreviewTitle: { fontSize: 13, lineHeight: 19, fontWeight: "800" },
  newsPreviewMeta: { fontSize: 10, lineHeight: 15 },
  appointmentSection: { gap: 11 },
  actionGrid: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1,
    minHeight: 148,
    borderRadius: 21,
    padding: 15,
    justifyContent: "space-between",
  },
  actionIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 11,
  },
  actionSub: {
    color: "rgba(255,255,255,0.77)",
    fontSize: 11,
    marginTop: 2,
    marginBottom: 9,
  },
  symptomCard: { gap: 13 },
  inputHeading: { flexDirection: "row", alignItems: "center", gap: 9 },
  inputIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  inputHeadingText: { fontWeight: "700", fontSize: 14 },
  symptomInput: {
    minHeight: 75,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    lineHeight: 21,
  },
  continueLink: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueText: { fontSize: 13, fontWeight: "700" },
  appointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    borderRadius: 18,
  },
  appointmentIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  appointmentCopy: { flex: 1, gap: 4 },
  appointmentTitle: { fontSize: 13, fontWeight: "700" },
  appointmentSub: { fontSize: 12 },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 13,
  },
  disclaimerText: { fontSize: 11, lineHeight: 17, flex: 1 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  notificationPanel: {
    width: "100%",
    maxWidth: 430,
    borderRadius: 22,
    padding: 17,
    gap: 13,
  },
  notificationPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationTitle: { fontSize: 15, fontWeight: "800" },
  notificationSub: { fontSize: 10, marginTop: 3 },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  notificationDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
  notificationItemCopy: { flex: 1, gap: 4 },
  notificationItemTitle: { fontSize: 12, lineHeight: 18, fontWeight: "700" },
  notificationItemSub: { fontSize: 10, lineHeight: 15 },
  notificationEmpty: {
    minHeight: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  notificationEmptyText: { fontSize: 11, textAlign: "center" },
  testNotificationButton: {
    minHeight: 42,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  testNotificationText: { fontSize: 12, fontWeight: "800" },
});
