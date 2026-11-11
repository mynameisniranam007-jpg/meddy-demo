import React, { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Alert,
  Pressable,
  ScrollView,
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
import { hospitalById } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import { useMedtriage } from "@/context/MedtriageContext";
import FamilyProfiles from "@/components/FamilyProfiles";

const timeSlots = [
  "08:00–08:30",
  "09:00–09:30",
  "10:00–10:30",
  "11:00–11:30",
  "12:30–13:00",
  "14:00–14:30",
  "15:00–15:30",
  "16:00–16:30",
  "17:00–17:30",
  "18:00–18:30",
  "19:00–19:30",
  "20:00–20:30",
  "20:30–21:00",
];
const busyRateByDoctor = [3, 6, 8, 4, 9];
const dayHasSlots = (dayIndex: number, doctorIndex: number) =>
  (dayIndex * 7 + doctorIndex * 5 + 2) % 17 !== 0;
const slotHasCapacity = (
  dayIndex: number,
  doctorIndex: number,
  slotIndex: number,
) =>
  dayHasSlots(dayIndex, doctorIndex) &&
  (dayIndex * 11 + doctorIndex * 7 + slotIndex * 5 + 3) %
    busyRateByDoctor[doctorIndex] !==
    0;
const sampleDoctors = [
  {
    name: "นพ. ธนกฤต วัฒนาพงศ์",
    specialty: "เวชศาสตร์ครอบครัว",
    gender: "ชาย",
  },
  { name: "นพ. ปกรณ์ ศิริกุล", specialty: "อายุรศาสตร์", gender: "ชาย" },
  { name: "นพ. กิตติพงษ์ ธารา", specialty: "เวชปฏิบัติทั่วไป", gender: "ชาย" },
  { name: "พญ. พิมพ์ชนก รุ่งเรือง", specialty: "อายุรศาสตร์", gender: "หญิง" },
  {
    name: "พญ. ณัฐชา วงศ์สวัสดิ์",
    specialty: "เวชศาสตร์ครอบครัว",
    gender: "หญิง",
  },
];

export default function BookingScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{
    hospitalId?: string;
    mode?: string;
    department?: string;
  }>();
  const hospital = hospitalById(params.hospitalId);
  const selectedDepartment =
    typeof params.department === "string"
      ? params.department
      : hospital.department;
  const kind = params.mode === "checkin" ? "checkin" : "advance";
  const {
    setSelectedHospital,
    saveAppointment,
    session,
    activePatient,
    requestAuth,
    requestProfile,
    bookingDraft,
    setBookingDraft,
    pendingTriageSession,
  } = useMedtriage();
  const draft = bookingDraft?.hospitalId === hospital.id ? bookingDraft : null;
  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date;
      }),
    [],
  );
  const [selectedDay, setSelectedDay] = useState(draft?.day ?? 0);
  const [selectedTime, setSelectedTime] = useState<string | null>(
    draft?.time ?? timeSlots[0],
  );
  const [selectedDoctor, setSelectedDoctor] = useState(
    sampleDoctors[draft?.doctor ?? 0],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBookingDraft({
      hospitalId: hospital.id,
      day: selectedDay,
      time: selectedTime,
      doctor: sampleDoctors.findIndex((d) => d.name === selectedDoctor.name),
    });
  }, [
    hospital.id,
    selectedDay,
    selectedTime,
    selectedDoctor.name,
    setBookingDraft,
  ]);
  const destination = {
    pathname: "/booking" as const,
    params: {
      hospitalId: hospital.id,
      department: selectedDepartment,
      mode: kind,
    },
  };
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);

  const confirmBooking = async () => {
    if (!session) {
      requestAuth(destination);
      return;
    }
    if (
      !activePatient?.profile.fullName ||
      !/^0\d{9}$/.test(activePatient.profile.phone.replace(/\D/g, ""))
    ) {
      requestProfile(destination);
      return;
    }
    if (!selectedTime) {
      Alert.alert("เลือกช่วงเวลาก่อน", "แตะเลือกเวลาที่มีคิวว่าง");
      return;
    }
    setSaving(true);
    const appointment = {
      reference: `DEMO-${Date.now().toString().slice(-6)}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      department: selectedDepartment,
      doctor: `${selectedDoctor.name} · ${selectedDoctor.specialty}`,
      dateISO: days[selectedDay].toISOString(),
      dateLabel: formatDate(days[selectedDay]),
      timeSlot: selectedTime,
      kind,
    } as const;
    try {
      setSelectedHospital(hospital);
      await saveAppointment(appointment);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/pass");
    } catch (error) {
      Alert.alert(
        "บันทึกนัดหมายไม่ได้",
        error instanceof Error ? error.message : "ลองอีกครั้งก่อนยืนยันคิว",
      );
    } finally {
      setSaving(false);
    }
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
          <Eyebrow>
            {kind === "checkin" ? "คิวเช็คอิน" : "นัดหมายล่วงหน้า"}
          </Eyebrow>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            เลือกแพทย์และวันเวลา
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.demoBanner, { backgroundColor: colors.secondary }]}>
        <Feather name="info" size={16} color={colors.secondaryForeground} />
        <Text style={[styles.demoText, { color: colors.secondaryForeground }]}>
          ข้อมูลแพทย์และคิวเป็นตัวอย่าง ไม่ได้จองกับโรงพยาบาลจริง
        </Text>
      </View>

      <FamilyProfiles />
      <SurfaceCard style={{ gap: 8 }}>
        <SectionTitle title="ผู้ป่วยสำหรับการจองนี้" />
        <BodyText>
          {activePatient?.profile.fullName || "เลือกผู้ป่วยหลังเข้าสู่ระบบ"}
        </BodyText>
        {pendingTriageSession ? (
          <>
            <Text style={{ color: colors.foreground, fontWeight: "700" }}>
              ข้อมูลคัดกรองที่เลือกไว้
            </Text>
            <BodyText>
              {pendingTriageSession.symptoms ||
                pendingTriageSession.bodyParts.join(" · ") ||
                "แนบภาพอาการ"}
            </BodyText>
            {pendingTriageSession.assessment ? (
              <BodyText>
                {pendingTriageSession.assessment.name} · ระดับตัวอย่าง:{" "}
                {pendingTriageSession.assessment.level === 3
                  ? "เร่งด่วน"
                  : pendingTriageSession.assessment.level === 2
                    ? "ปานกลาง"
                    : "น้อย"}
              </BodyText>
            ) : null}
          </>
        ) : (
          <BodyText>ยังไม่มีข้อมูลคัดกรองในรายการนี้</BodyText>
        )}
      </SurfaceCard>
      <SectionTitle
        title="เลือกแพทย์"
        detail="เลือกจากแพทย์ตัวอย่าง 5 คน · ชาย 3 คน หญิง 2 คน · คิวจำลองแยกตามแพทย์"
      />
      <View style={styles.doctorList}>
        {sampleDoctors.map((doctor, index) => {
          const selected = selectedDoctor.name === doctor.name;
          const fullCount = timeSlots.filter(
            (_, slotIndex) => !slotHasCapacity(selectedDay, index, slotIndex),
          ).length;
          return (
            <Pressable
              key={doctor.name}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setSelectedDoctor(doctor);
                const nextDay = dayHasSlots(selectedDay, index)
                  ? selectedDay
                  : days.findIndex((_, dayIndex) =>
                      dayHasSlots(dayIndex, index),
                    );
                setSelectedDay(Math.max(0, nextDay));
                const first = timeSlots.findIndex((_, slotIndex) =>
                  slotHasCapacity(Math.max(0, nextDay), index, slotIndex),
                );
                setSelectedTime(first < 0 ? null : timeSlots[first]);
              }}
              style={[
                styles.doctorCard,
                {
                  backgroundColor: selected ? colors.secondary : colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.doctorAvatar,
                  { backgroundColor: index < 3 ? "#E6F0FA" : "#FBE9F0" },
                ]}
              >
                <Feather
                  name="user"
                  size={18}
                  color={index < 3 ? "#28628A" : "#A14365"}
                />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.doctorName, { color: colors.foreground }]}>
                  {doctor.name}
                </Text>
                <Text
                  style={[styles.doctorSub, { color: colors.mutedForeground }]}
                >
                  {doctor.specialty} · {doctor.gender} · ข้อมูลตัวอย่าง
                </Text>
              </View>
              <View
                style={[
                  styles.doctorStatus,
                  { backgroundColor: fullCount > 0 ? "#FCE8E7" : "#E2F5EC" },
                ]}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "800",
                    color: fullCount > 0 ? "#B53D39" : "#247451",
                  }}
                >
                  {fullCount >= timeSlots.length
                    ? "คิวเต็ม"
                    : fullCount > 0
                      ? `เต็ม ${fullCount} ช่วง`
                      : "ยังมีคิวว่าง"}
                </Text>
              </View>
              {selected ? (
                <Feather name="check-circle" size={19} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <SurfaceCard style={styles.hospitalCard}>
        <View style={styles.hospitalTop}>
          <View
            style={[styles.hospitalIcon, { backgroundColor: colors.accent }]}
          >
            <Feather
              name="plus-square"
              size={20}
              color={colors.accentForeground}
            />
          </View>
          <Pill tone={hospital.kind === "โรงพยาบาลรัฐ" ? "blue" : "teal"}>
            {hospital.kind}
          </Pill>
        </View>
        <Text style={[styles.hospitalName, { color: colors.foreground }]}>
          {hospital.name}
        </Text>
        <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
          <Feather
            name="activity"
            size={15}
            color={colors.secondaryForeground}
          />
          <Text style={[styles.detailText, { color: colors.foreground }]}>
            {selectedDepartment}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="user" size={15} color={colors.secondaryForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {hospital.doctor}
          </Text>
        </View>
      </SurfaceCard>

      <View style={styles.section}>
        <SectionTitle
          title="เลือกวันที่"
          detail={
            kind === "checkin"
              ? "เลือกช่วงเวลาเช็คอินตัวอย่าง"
              : "เลือกได้ 14 วันข้างหน้า · สถานะคิวจำลองแยกตามแพทย์"
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayGrid}
        >
          {days.map((day, index) => {
            const selected = selectedDay === index;
            const doctorIndex = sampleDoctors.findIndex(
              (doctor) => doctor.name === selectedDoctor.name,
            );
            const hasSlots = dayHasSlots(index, doctorIndex);
            return (
              <Pressable
                key={day.toISOString()}
                disabled={!hasSlots}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: !hasSlots }}
                testID={`booking-day-${index}`}
                onPress={() => {
                  setSelectedDay(index);
                  const first = timeSlots.findIndex((_, slotIndex) =>
                    slotHasCapacity(index, doctorIndex, slotIndex),
                  );
                  setSelectedTime(first < 0 ? null : timeSlots[first]);
                }}
                style={({ pressed }) => [
                  styles.dayButton,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: !hasSlots ? 0.55 : pressed ? 0.78 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayName,
                    { color: selected ? "#D5E6ED" : colors.mutedForeground },
                  ]}
                >
                  {index === 0
                    ? "วันนี้"
                    : new Intl.DateTimeFormat("th-TH", {
                        weekday: "short",
                      }).format(day)}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    { color: selected ? "#FFFFFF" : colors.foreground },
                  ]}
                >
                  {new Intl.DateTimeFormat("th-TH", { day: "numeric" }).format(
                    day,
                  )}
                </Text>
                <Text
                  style={[
                    styles.dayMonth,
                    { color: selected ? "#D5E6ED" : colors.mutedForeground },
                  ]}
                >
                  {new Intl.DateTimeFormat("th-TH", { month: "short" }).format(
                    day,
                  )}
                </Text>
                {!hasSlots ? (
                  <View style={styles.fullBadge}>
                    <View style={styles.fullDot} />
                    <Text style={styles.fullText}>เต็ม</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="เลือกช่วงเวลา"
          detail="มีช่วงนัดตั้งแต่ 08:00 ถึง 21:00 · คิวเต็มแสดงเป็นสีแดง · สถานะจำลองแยกตามแพทย์และวัน"
        />
        <View style={styles.slotGrid}>
          {timeSlots.map((slot, index) => {
            const selected = selectedTime === slot;
            const doctorIndex = sampleDoctors.findIndex(
              (doctor) => doctor.name === selectedDoctor.name,
            );
            const available = slotHasCapacity(selectedDay, doctorIndex, index);
            return (
              <Pressable
                key={slot}
                disabled={!available}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: !available }}
                testID={`booking-slot-${index}`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedTime(slot);
                }}
                style={({ pressed }) => [
                  styles.slotButton,
                  {
                    backgroundColor: !available
                      ? "#FCE8E7"
                      : selected
                        ? colors.accent
                        : colors.card,
                    borderColor: !available
                      ? "#D94B45"
                      : selected
                        ? colors.accentForeground
                        : colors.border,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.slotTime,
                    { color: available ? colors.foreground : "#B53D39" },
                  ]}
                >
                  {slot}
                </Text>
                <View style={styles.slotStatus}>
                  <View
                    style={[
                      styles.availableDot,
                      { backgroundColor: available ? "#36A27D" : "#D94B45" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.slotStatusText,
                      { color: available ? colors.mutedForeground : "#B53D39" },
                    ]}
                  >
                    {available ? "มีคิวว่าง" : "เต็ม"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SurfaceCard style={styles.estimateCard}>
        <View style={styles.estimateRow}>
          <Feather
            name="credit-card"
            size={17}
            color={colors.secondaryForeground}
          />
          <Text
            style={[styles.estimateLabel, { color: colors.mutedForeground }]}
          >
            ค่าใช้จ่ายโดยประมาณ
          </Text>
          <Text style={[styles.estimateValue, { color: colors.foreground }]}>
            {hospital.cost}
          </Text>
        </View>
        <BodyText style={styles.estimateNote}>
          ตัวเลขค่าใช้จ่ายและสถานะคิวเป็นข้อมูลสมมติสำหรับการนำเสนอ
        </BodyText>
      </SurfaceCard>

      <PrimaryButton
        title={session ? "ยืนยันการนัดหมาย" : "เข้าสู่ระบบเพื่อยืนยันนัดหมาย"}
        icon="check"
        onPress={() => void confirmBooking()}
        disabled={!selectedTime}
        loading={saving}
        testID="confirm-appointment"
      />
      <Text style={[styles.footnote, { color: colors.mutedForeground }]}>
        กดยืนยันเพื่อสร้างบัตรคิวตัวอย่างไว้ในอุปกรณ์นี้
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 18 },
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
  hospitalCard: { gap: 11 },
  hospitalTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hospitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalName: { fontSize: 15, lineHeight: 22, fontWeight: "800" },
  detailRow: {
    borderTopWidth: 1,
    borderTopColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 9,
  },
  detailText: { flex: 1, fontSize: 12, lineHeight: 18 },
  section: { gap: 12 },
  doctorList: { gap: 8 },
  doctorCard: {
    minHeight: 69,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  doctorName: { fontSize: 12, fontWeight: "800" },
  doctorSub: { fontSize: 10, lineHeight: 15 },
  doctorStatus: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9 },
  dayGrid: { flexDirection: "row", gap: 7 },
  dayButton: {
    width: 66,
    minHeight: 88,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  fullBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  fullDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D94B45" },
  fullText: { fontSize: 8, fontWeight: "800", color: "#B53D39" },
  dayName: { fontSize: 10, fontWeight: "600" },
  dayNumber: { fontSize: 19, fontWeight: "800" },
  dayMonth: { fontSize: 10 },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  slotButton: {
    width: "48%",
    minHeight: 70,
    borderWidth: 1,
    borderRadius: 15,
    padding: 11,
    justifyContent: "center",
    gap: 7,
  },
  slotTime: { fontSize: 13, fontWeight: "800" },
  slotStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  availableDot: { width: 6, height: 6, borderRadius: 3 },
  slotStatusText: { fontSize: 10 },
  estimateCard: { gap: 8, padding: 14 },
  estimateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  estimateLabel: { flex: 1, fontSize: 11 },
  estimateValue: { fontSize: 12, fontWeight: "800" },
  estimateNote: { fontSize: 10, lineHeight: 16 },
  footnote: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: -7,
  },
});

