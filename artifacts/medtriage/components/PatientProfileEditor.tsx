import { KeyboardAwareForm } from "@/components/KeyboardAwareScrollViewCompat";
import React, { useState } from "react";
import { useMedtriage } from "@/context/MedtriageContext";
import { cleanText } from "@/utils/auth";
import { Feather } from "@expo/vector-icons";
import {
  Modal,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BodyText,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  SurfaceCard,
} from "@/components/UI";
import {
  calculateAge,
  calculateBmi,
  formatPatientName,
  normalizePatientProfile,
  formatNationalId,
  formatPhone,
  PatientProfile,
} from "@/constants/profile";
import { useColors } from "@/hooks/useColors";

type Props = {
  initialProfile?: PatientProfile;
  setup: boolean;
  onSaved: (profile: PatientProfile) => void;
  onCancel?: () => void;
};

export default function PatientProfileEditor({
  initialProfile,
  setup,
  onSaved,
  onCancel,
}: Props) {
  const colors = useColors();
  const { savePatientProfile } = useMedtriage();
  const [profile, setProfile] = useState<PatientProfile>(() =>
    normalizePatientProfile(initialProfile),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarMode, setCalendarMode] = useState<"days" | "months" | "years">(
    "days",
  );
  const [yearPageStart, setYearPageStart] = useState(
    () => Math.floor((new Date().getFullYear() + 543) / 10) * 10 - 9,
  );
  const age = calculateAge(profile.birthDate);
  const bmi = calculateBmi(profile.weightKg, profile.heightCm);

  const update = (key: keyof PatientProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const save = async () => {
    if (!profile.firstName.trim()) {
      setError("กรอกชื่อผู้ป่วย");
      return;
    }
    if (
      profile.nationalId &&
      profile.nationalId.replace(/\D/g, "").length !== 13
    ) {
      setError("เลขบัตรประชาชนต้องมี 13 หลัก หรือเว้นว่าง");
      return;
    }
    if (profile.phone && profile.phone.replace(/\D/g, "").length !== 10) {
      setError("เบอร์โทรต้องมี 10 หลัก หรือเว้นว่าง");
      return;
    }
    if (profile.birthDate && age === null) {
      setError("กรอกวันเกิดให้ถูกต้อง หรือเว้นว่าง");
      return;
    }
    if (
      profile.emergencyPhone &&
      profile.emergencyPhone.replace(/\D/g, "").length !== 10
    ) {
      setError("เบอร์ฉุกเฉินต้องมี 10 หลัก");
      return;
    }
    setSaving(true);
    try {
      const normalized = normalizePatientProfile({
        ...Object.fromEntries(
          Object.entries(profile).map(([key, value]) => [
            key,
            cleanText(value, 2000),
          ]),
        ),
        fullName: formatPatientName(profile),
        nationalId: profile.nationalId.replace(/\D/g, "").slice(0, 13),
      });
      await savePatientProfile(normalized);
      onSaved(normalized);
    } catch {
      setError("บันทึกข้อมูลไม่ได้ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAwareForm>
      <SurfaceCard style={styles.formCard}>
        <View style={styles.formHeading}>
          <View
            style={[styles.formIcon, { backgroundColor: colors.secondary }]}
          >
            <Feather
              name="clipboard"
              size={18}
              color={colors.secondaryForeground}
            />
          </View>
          <View style={styles.formHeadingCopy}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              {setup ? "กรอกประวัติก่อนเริ่มใช้งาน" : "แก้ไขประวัติส่วนตัว"}
            </Text>
            <Text style={[styles.formSub, { color: colors.mutedForeground }]}>
              ข้อมูลนี้บันทึกไว้ในอุปกรณ์สำหรับโหมดตัวอย่าง
            </Text>
          </View>
        </View>

        <View
          style={[styles.privacyNotice, { backgroundColor: colors.secondary }]}
        >
          <Feather name="lock" size={14} color={colors.secondaryForeground} />
          <Text
            style={[styles.privacyText, { color: colors.secondaryForeground }]}
          >
            ระบบยังไม่เชื่อม ThaID หรือพื้นที่จัดเก็บที่ปลอดภัย
            กรุณาใช้ข้อมูลสมมติในเวอร์ชันทดลอง
          </Text>
        </View>

        <SectionTitle title="ข้อมูลทั่วไป" />
        <ChoiceGroup
          label="คำนำหน้า"
          options={["นาย", "นาง", "นางสาว"]}
          value={profile.title}
          onChange={(value) => update("title", value)}
        />
        <View style={styles.measurementRow}>
          <LabeledField
            half
            label="ชื่อ"
            value={profile.firstName}
            onChangeText={(value) => update("firstName", value)}
            placeholder="ชื่อ"
          />
          <LabeledField
            half
            label="นามสกุล"
            value={profile.lastName}
            onChangeText={(value) => update("lastName", value)}
            placeholder="นามสกุล"
          />
        </View>
        <LabeledField
          label="เลขบัตรประชาชน"
          value={formatNationalId(profile.nationalId)}
          onChangeText={(value) =>
            update("nationalId", value.replace(/\D/g, "").slice(0, 13))
          }
          placeholder="x-xxxx-xxxxx-xx-x"
          keyboardType="number-pad"
          maxLength={17}
        />
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
            วันเกิด
          </Text>
          <Pressable
            onPress={() => {
              setCalendarMonth(new Date());
              setCalendarMode("days");
              setCalendarOpen(true);
            }}
            style={[
              styles.input,
              {
                borderColor: colors.input,
                backgroundColor: colors.background,
                justifyContent: "center",
              },
            ]}
          >
            <Text
              style={{
                color: profile.birthDate
                  ? colors.foreground
                  : colors.mutedForeground,
              }}
            >
              {profile.birthDate || "เลือกวันเกิดจากปฏิทิน"}
            </Text>
          </Pressable>
        </View>
        <Modal
          visible={calendarOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCalendarOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.calendar, { backgroundColor: colors.card }]}>
              <View style={styles.calendarHead}>
                {calendarMode === "days" ? (
                  <Pressable
                    accessibilityLabel="เดือนก่อน"
                    onPress={() =>
                      setCalendarMonth(
                        (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
                      )
                    }
                  >
                    <Feather
                      name="chevron-left"
                      size={22}
                      color={colors.foreground}
                    />
                  </Pressable>
                ) : calendarMode === "years" ? (
                  <Pressable
                    accessibilityLabel="สิบปีก่อน"
                    onPress={() =>
                      setYearPageStart((y) => Math.max(2400, y - 10))
                    }
                  >
                    <Feather
                      name="chevron-left"
                      size={22}
                      color={colors.foreground}
                    />
                  </Pressable>
                ) : (
                  <View style={{ width: 22 }} />
                )}
                {calendarMode === "days" ? (
                  <Pressable
                    onPress={() => setCalendarMode("months")}
                    accessibilityRole="button"
                    accessibilityLabel="เลือกเดือนและปี"
                  >
                    <Text
                      style={[
                        styles.calendarTitle,
                        { color: colors.foreground },
                      ]}
                    >
                      {new Intl.DateTimeFormat("th-TH", {
                        month: "long",
                        year: "numeric",
                      }).format(calendarMonth)}{" "}
                      ▾
                    </Text>
                  </Pressable>
                ) : calendarMode === "months" ? (
                  <Pressable
                    onPress={() => {
                      setYearPageStart(
                        Math.floor((calendarMonth.getFullYear() + 543) / 10) *
                          10 -
                          9,
                      );
                      setCalendarMode("years");
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarTitle,
                        { color: colors.foreground },
                      ]}
                    >
                      {calendarMonth.getFullYear() + 543} ▾
                    </Text>
                  </Pressable>
                ) : (
                  <Text
                    style={[styles.calendarTitle, { color: colors.foreground }]}
                  >
                    {yearPageStart}–
                    {Math.min(
                      yearPageStart + 9,
                      new Date().getFullYear() + 543,
                    )}
                  </Text>
                )}
                {calendarMode === "days" ? (
                  <Pressable
                    accessibilityLabel="เดือนถัดไป"
                    onPress={() =>
                      setCalendarMonth(
                        (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
                      )
                    }
                  >
                    <Feather
                      name="chevron-right"
                      size={22}
                      color={colors.foreground}
                    />
                  </Pressable>
                ) : calendarMode === "years" ? (
                  <Pressable
                    accessibilityLabel="สิบปีถัดไป"
                    onPress={() =>
                      setYearPageStart((y) =>
                        Math.min(new Date().getFullYear() + 543 - 9, y + 10),
                      )
                    }
                  >
                    <Feather
                      name="chevron-right"
                      size={22}
                      color={colors.foreground}
                    />
                  </Pressable>
                ) : (
                  <View style={{ width: 22 }} />
                )}
              </View>
              {calendarMode === "years" ? (
                <View style={styles.calendarGrid}>
                  {Array.from({ length: 10 }, (_, i) => yearPageStart + i)
                    .filter((year) => year <= new Date().getFullYear() + 543)
                    .map((year) => (
                      <Pressable
                        key={year}
                        onPress={() => {
                          setCalendarMonth(
                            (m) => new Date(year - 543, m.getMonth(), 1),
                          );
                          setCalendarMode("months");
                        }}
                        style={[
                          styles.dayChoice,
                          styles.yearChoice,
                          {
                            backgroundColor:
                              calendarMonth.getFullYear() + 543 === year
                                ? colors.primary
                                : colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              calendarMonth.getFullYear() + 543 === year
                                ? colors.primaryForeground
                                : colors.foreground,
                            fontWeight: "700",
                          }}
                        >
                          {year}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              ) : calendarMode === "months" ? (
                <View style={styles.calendarGrid}>
                  {Array.from({ length: 12 }, (_, month) => month).map(
                    (month) => (
                      <Pressable
                        key={month}
                        onPress={() => {
                          setCalendarMonth(
                            (m) => new Date(m.getFullYear(), month, 1),
                          );
                          setCalendarMode("days");
                        }}
                        style={[
                          styles.dayChoice,
                          styles.monthChoice,
                          {
                            backgroundColor:
                              calendarMonth.getMonth() === month
                                ? colors.primary
                                : colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              calendarMonth.getMonth() === month
                                ? colors.primaryForeground
                                : colors.foreground,
                            fontWeight: "700",
                          }}
                        >
                          {new Intl.DateTimeFormat("th-TH", {
                            month: "short",
                          }).format(new Date(2020, month, 1))}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              ) : (
                <View style={styles.calendarGrid}>
                  {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                    <Text
                      key={d}
                      style={[
                        styles.weekday,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {d}
                    </Text>
                  ))}
                  {Array.from(
                    {
                      length: new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth(),
                        1,
                      ).getDay(),
                    },
                    (_, i) => (
                      <View key={`empty-${i}`} style={styles.calendarDay} />
                    ),
                  )}
                  {Array.from(
                    {
                      length: new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        0,
                      ).getDate(),
                    },
                    (_, i) => {
                      const day = i + 1;
                      return (
                        <Pressable
                          key={day}
                          style={[
                            styles.calendarDay,
                            styles.dayChoice,
                            {
                              backgroundColor:
                                profile.birthDate ===
                                `${String(day).padStart(2, "0")}/${String(calendarMonth.getMonth() + 1).padStart(2, "0")}/${calendarMonth.getFullYear() + 543}`
                                  ? colors.primary
                                  : "transparent",
                            },
                          ]}
                          onPress={() => {
                            update(
                              "birthDate",
                              `${String(day).padStart(2, "0")}/${String(calendarMonth.getMonth() + 1).padStart(2, "0")}/${calendarMonth.getFullYear() + 543}`,
                            );
                            setCalendarOpen(false);
                          }}
                        >
                          <Text style={{ color: colors.foreground }}>
                            {day}
                          </Text>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              )}
              <SecondaryButton
                title="ปิด"
                onPress={() => setCalendarOpen(false)}
              />
            </View>
          </View>
        </Modal>
        <Text
          style={[styles.calculatedText, { color: colors.secondaryForeground }]}
        >
          อายุ: {age === null ? "กรอกวันเกิดเพื่อคำนวณอัตโนมัติ" : `${age} ปี`}
        </Text>
        <ChoiceGroup
          label="เพศ"
          options={["หญิง", "ชาย"]}
          value={profile.gender}
          onChange={(value) => update("gender", value)}
        />
        <LabeledField
          label="เบอร์โทรศัพท์"
          value={formatPhone(profile.phone)}
          onChangeText={(value) =>
            update("phone", value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="0xx-xxx-xxxx"
          keyboardType="phone-pad"
          maxLength={12}
        />
        <LabeledField
          label="ที่อยู่"
          value={profile.address}
          onChangeText={(value) => update("address", value)}
          placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
          multiline
        />

        <SectionTitle title="ข้อมูลสุขภาพเบื้องต้น" />
        <ChoiceGroup
          label="กรุ๊ปเลือด"
          options={["A", "B", "AB", "O", "ไม่ทราบ"]}
          value={profile.bloodGroup}
          onChange={(value) => update("bloodGroup", value)}
        />
        <ChoiceGroup
          label="Rh factor"
          options={["Rh+", "Rh-", "ไม่ทราบ"]}
          value={profile.rhFactor}
          onChange={(value) => update("rhFactor", value)}
        />
        {profile.bloodGroup === "ไม่ทราบ" || profile.rhFactor === "ไม่ทราบ" ? (
          <Text
            style={[styles.helpText, { color: colors.secondaryForeground }]}
          >
            หากไม่ทราบกรุ๊ปเลือดหรือ Rh factor
            แนะนำตรวจเลือดที่สถานพยาบาลก่อนบันทึกข้อมูล
          </Text>
        ) : null}
        <View style={styles.measurementRow}>
          <LabeledField
            half
            label="น้ำหนัก (กก.)"
            value={profile.weightKg}
            onChangeText={(value) => update("weightKg", value)}
            placeholder="เช่น 60"
            keyboardType="decimal-pad"
          />
          <LabeledField
            half
            label="ส่วนสูง (ซม.)"
            value={profile.heightCm}
            onChangeText={(value) => update("heightCm", value)}
            placeholder="เช่น 165"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={[styles.bmiBox, { backgroundColor: colors.background }]}>
          <Feather
            name="activity"
            size={15}
            color={colors.secondaryForeground}
          />
          <Text style={[styles.bmiText, { color: colors.foreground }]}>
            BMI:{" "}
            {bmi === null ? "กรอกน้ำหนักและส่วนสูงเพื่อคำนวณ" : bmi.toFixed(1)}
          </Text>
        </View>
        <LabeledField
          label="โรคประจำตัว"
          value={profile.conditions}
          onChangeText={(value) => update("conditions", value)}
          placeholder="หากไม่มี กรุณากรอก “ไม่มี”"
          multiline
          minHeight={88}
        />
        <LabeledField
          label="ประวัติแพ้ยา"
          value={profile.drugAllergies}
          onChangeText={(value) => update("drugAllergies", value)}
          placeholder="ชื่อยาและอาการแพ้ หรือกรอก “ไม่มี”"
          multiline
          minHeight={112}
        />
        <LabeledField
          label="ประวัติแพ้อาหาร"
          value={profile.foodAllergies}
          onChangeText={(value) => update("foodAllergies", value)}
          placeholder="ชนิดอาหาร/อาการ หรือกรอก “ไม่มี”"
          multiline
        />
        <LabeledField
          label="ยาที่ใช้ประจำ"
          value={profile.medications}
          onChangeText={(value) => update("medications", value)}
          placeholder="ชื่อยา/ขนาดยา หรือกรอก “ไม่มี”"
          multiline
        />

        <SectionTitle title="ผู้ติดต่อฉุกเฉินและสิทธิรักษา" />
        <LabeledField
          label="ชื่อผู้ติดต่อฉุกเฉิน"
          value={profile.emergencyName}
          onChangeText={(value) => update("emergencyName", value)}
          placeholder="ชื่อ-นามสกุล"
        />
        <LabeledField
          label="ความสัมพันธ์"
          value={profile.emergencyRelation}
          onChangeText={(value) => update("emergencyRelation", value)}
          placeholder="เช่น บิดา มารดา คู่สมรส"
        />
        <LabeledField
          label="เบอร์ผู้ติดต่อฉุกเฉิน"
          value={formatPhone(profile.emergencyPhone)}
          onChangeText={(value) =>
            update("emergencyPhone", value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="08x-xxx-xxxx"
          keyboardType="phone-pad"
          maxLength={12}
        />
        <ChoiceGroup
          label="สิทธิการรักษา"
          options={[
            "บัตรทอง",
            "ประกันสังคม",
            "ข้าราชการ",
            "ประกันเอกชน",
            "จ่ายเอง",
          ]}
          value={profile.coverage}
          onChange={(value) => update("coverage", value)}
        />

        {error ? (
          <Text
            accessibilityRole="alert"
            style={[styles.errorText, { color: colors.destructive }]}
          >
            {error}
          </Text>
        ) : null}
        <View style={styles.formActions}>
          {!setup && onCancel ? (
            <SecondaryButton
              title="ยกเลิก"
              onPress={onCancel}
              style={styles.actionButton}
            />
          ) : null}
          <PrimaryButton
            title={setup ? "บันทึกและเริ่มใช้งาน" : "บันทึก"}
            icon="check"
            onPress={() => void save()}
            loading={saving}
            testID="save-patient-profile"
            style={styles.actionButton}
          />
        </View>
        <BodyText style={styles.requiredNote}>
          * กรอกเฉพาะข้อมูลที่ทราบ ข้อมูลแพ้ยาที่ยังว่างหมายถึงยังไม่ทราบ
          ไม่ใช่ไม่มีประวัติแพ้
        </BodyText>
      </SurfaceCard>
    </KeyboardAwareForm>
  );
}

function LabeledField({
  half = false,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
  maxLength,
  minHeight,
}: {
  half?: boolean;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  minHeight?: number;
}) {
  const colors = useColors();
  return (
    <View style={[styles.field, half ? styles.fieldHalf : null]}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          minHeight ? { minHeight } : null,
          {
            color: colors.foreground,
            borderColor: colors.input,
            backgroundColor: colors.background,
          },
        ]}
      />
    </View>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.choiceGroup}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.choiceOptions}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.choice,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : colors.card,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  {
                    color: selected
                      ? colors.primaryForeground
                      : colors.foreground,
                  },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: 13, padding: 15 },
  formHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  formIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  formHeadingCopy: { flex: 1, gap: 3 },
  formTitle: { fontSize: 15, fontWeight: "800" },
  formSub: { fontSize: 10, lineHeight: 15 },
  privacyNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 12,
  },
  privacyText: { flex: 1, fontSize: 10, lineHeight: 16, fontWeight: "600" },
  field: { gap: 8, flexShrink: 0 },
  fieldHalf: { flex: 1, minWidth: 0 },
  fieldLabel: { fontSize: 13, fontWeight: "700" },
  input: {
    outlineWidth: 0,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  multilineInput: { minHeight: 68 },
  calculatedText: { fontSize: 11, fontWeight: "700", marginTop: -8 },
  choiceGroup: { gap: 7 },
  choiceOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  choice: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderWidth: 1.5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: { fontSize: 13, fontWeight: "700" },
  measurementRow: { flexDirection: "row", gap: 10 },
  bmiBox: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bmiText: { fontSize: 11, fontWeight: "700" },
  errorText: { fontSize: 12, lineHeight: 18, fontWeight: "700" },
  formActions: { flexDirection: "row", gap: 8 },
  actionButton: { flex: 1 },
  requiredNote: { fontSize: 9, lineHeight: 14, textAlign: "center" },
  helpText: { fontSize: 10, lineHeight: 15 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  calendar: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  calendarHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarTitle: { fontSize: 15, fontWeight: "800" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: {
    width: "14.285%",
    height: 34,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  calendarDay: {
    width: "14.285%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChoice: { borderRadius: 13 },
  yearChoice: {
    width: "30%",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    margin: "1.5%",
  },
  monthChoice: {
    width: "30%",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    margin: "1.5%",
  },
});

