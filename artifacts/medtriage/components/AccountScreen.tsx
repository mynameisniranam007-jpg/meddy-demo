import React, { useState } from "react";
import { router } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { AuthField } from "@/components/AuthField";
import { formatNationalId } from "@/constants/profile";
import { useColors } from "@/hooks/useColors";
import { isDemoAuth, registerAccount, signIn } from "@/utils/auth";
import { biometricSession } from "@/utils/biometrics";
import { useMedtriage } from "@/context/MedtriageContext";

export default function AccountScreen({
  register = false,
}: {
  register?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { authenticate } = useMedtriage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (biometric = false) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (register && password !== confirm)
        throw new Error("รหัสผ่านทั้งสองช่องต้องตรงกัน");
      const session = biometric
        ? await biometricSession()
        : register
          ? await registerAccount(identifier, password, firstName, lastName)
          : await signIn(identifier, password);
      authenticate(session);
      setPassword("");
      setConfirm("");
      router.replace("/profile-setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ทำรายการไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };
  const externalOption = (name: string, icon: React.ReactNode) => (
    <Pressable
      key={name}
      accessibilityRole="button"
      disabled={busy}
      accessibilityLabel={`${name} · ยังไม่เชื่อมต่อ`}
      onPress={() =>
        setNotice(
          `${name} ยังไม่เชื่อมต่อบริการ กรุณาใช้บัญชี Meddy หรือคัดกรองแบบไม่สมัคร`,
        )
      }
      style={({ pressed }) => [
        styles.outlineButton,
        {
          borderColor: colors.input,
          backgroundColor: pressed ? colors.secondary : colors.card,
          opacity: busy ? 0.5 : 1,
        },
      ]}
    >
      {icon}
      <Text style={[styles.outlineText, { color: colors.foreground }]}>
        {name}
      </Text>
    </Pressable>
  );
  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.page,
        {
          paddingTop: Platform.OS === "web" ? 24 : insets.top + 16,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.shell}>
        <View style={styles.topbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="กลับหน้าแรก"
            disabled={busy}
            onPress={() => router.replace("/")}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.brand}>
            <View
              style={[
                styles.logo,
                { backgroundColor: colors.secondaryForeground },
              ]}
            >
              <Feather name="plus" size={25} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              Meddy
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.heading}>
          <Text style={[styles.eyebrow, { color: colors.secondaryForeground }]}>
            {register ? "เริ่มดูแลสุขภาพไปด้วยกัน" : "ดีใจที่ได้พบคุณอีกครั้ง"}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {register ? "สร้างบัญชี Meddy" : "ยินดีต้อนรับกลับมา"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {register
              ? "สมัครเพียงไม่กี่ขั้นตอน แล้วค่อยเติมข้อมูลสุขภาพเมื่อพร้อม"
              : "เข้าสู่ระบบเพื่อดูนัดหมายและดูแลสุขภาพของคุณต่อ"}
          </Text>
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.form}>
            {register ? (
              <>
                <AuthField
                  label="ชื่อ (First Name)"
                  placeholder="กรอกชื่อ"
                  value={firstName}
                  onChangeText={setFirstName}
                  maxLength={100}
                  icon="user"
                  autoComplete="given-name"
                  disabled={busy}
                />
                <AuthField
                  label="นามสกุล (Last Name)"
                  placeholder="กรอกนามสกุล"
                  value={lastName}
                  onChangeText={setLastName}
                  maxLength={100}
                  icon="user"
                  autoComplete="family-name"
                  disabled={busy}
                />
              </>
            ) : null}
            <AuthField
              label="เลขบัตรประชาชน"
              placeholder="0-0000-00000-00-0"
              value={formatNationalId(identifier)}
              onChangeText={(v) =>
                setIdentifier(v.replace(/\D/g, "").slice(0, 13))
              }
              numeric
              maxLength={17}
              icon="credit-card"
              autoComplete={register ? "off" : "username"}
              disabled={busy}
            />
            <AuthField
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChangeText={setPassword}
              password
              maxLength={128}
              autoComplete={register ? "new-password" : "current-password"}
              disabled={busy}
            />
            {!register ? (
              <Pressable
                accessibilityRole="link"
                disabled={busy}
                onPress={() => {
                  setPassword("");
                  router.push("/forgot-password");
                }}
                style={({ pressed }) => [
                  styles.forgotLink,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.linkText,
                    { color: colors.secondaryForeground },
                  ]}
                >
                  ลืมรหัสผ่าน?
                </Text>
              </Pressable>
            ) : (
              <AuthField
                label="ยืนยันรหัสผ่าน"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirm}
                onChangeText={setConfirm}
                password
                maxLength={128}
                autoComplete="new-password"
                disabled={busy}
              />
            )}
            {error ? (
              <View
                style={[
                  styles.message,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.destructive,
                  },
                ]}
              >
                <Feather
                  name="alert-circle"
                  size={18}
                  color={colors.destructive}
                />
                <Text
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                  style={[styles.messageText, { color: colors.destructive }]}
                >
                  {error}
                </Text>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={register ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: "#176B68",
                  opacity: busy || pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryText}>
                    {register ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
                  </Text>
                  <Feather
                    name={register ? "user-plus" : "arrow-right"}
                    size={18}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>
            {!register ? (
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void submit(true)}
                style={({ pressed }) => [
                  styles.biometric,
                  { opacity: pressed || busy ? 0.5 : 1 },
                ]}
              >
                <Feather
                  name="maximize"
                  size={18}
                  color={colors.secondaryForeground}
                />
                <Text
                  style={[
                    styles.linkText,
                    { color: colors.secondaryForeground },
                  ]}
                >
                  Face ID / Touch ID
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.or, { color: colors.mutedForeground }]}>
              OR
            </Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>
          <View style={styles.externalRow}>
            {externalOption(
              "Google",
              <FontAwesome name="google" size={20} color={colors.foreground} />,
            )}
            {externalOption(
              "Apple",
              <FontAwesome name="apple" size={23} color={colors.foreground} />,
            )}
          </View>
          <View style={styles.externalRow}>
            {externalOption(
              "ThaID",
              <Feather
                name="credit-card"
                size={19}
                color={colors.secondaryForeground}
              />,
            )}
            {externalOption(
              "หมอพร้อม",
              <Feather
                name="heart"
                size={19}
                color={colors.secondaryForeground}
              />,
            )}
          </View>
          <Text
            style={[styles.externalHint, { color: colors.mutedForeground }]}
          >
            ตัวเลือกภายนอกเป็นตัวอย่าง · ยังไม่เชื่อมต่อบริการ
          </Text>
          {notice ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.notice,
                {
                  color: colors.secondaryForeground,
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              {notice}
            </Text>
          ) : null}
        </View>
        <View style={styles.footer}>
          <View style={styles.switchRow}>
            <Text
              style={[styles.footerText, { color: colors.mutedForeground }]}
            >
              {register ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}
            </Text>
            <Pressable
              accessibilityRole="link"
              disabled={busy}
              style={styles.textButton}
              onPress={() => {
                setPassword("");
                setConfirm("");
                router.replace(register ? "/login" : "/register");
              }}
            >
              <Text
                style={[styles.linkText, { color: colors.secondaryForeground }]}
              >
                {register ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="link"
            disabled={busy}
            style={styles.guestButton}
            onPress={() => router.replace("/triage")}
          >
            <Text
              style={[styles.footerText, { color: colors.secondaryForeground }]}
            >
              คัดกรองอาการก่อน โดยไม่สมัคร
            </Text>
            <Feather
              name="arrow-right"
              size={16}
              color={colors.secondaryForeground}
            />
          </Pressable>
          {isDemoAuth ? (
            <View style={styles.demoNote}>
              <Feather name="info" size={15} color={colors.mutedForeground} />
              <Text
                style={[styles.demoText, { color: colors.mutedForeground }]}
              >
                โหมดสาธิต · ใช้เลขบัตรสมมติ 13 หลักและรหัสผ่านสมมติ
                บัญชีเก็บในอุปกรณ์นี้ ยังไม่ยืนยันตัวตนจริง
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingHorizontal: 20, alignItems: "center" },
  shell: { width: "100%", maxWidth: 460, gap: 26 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 23, fontWeight: "800", letterSpacing: -0.5 },
  heading: { gap: 10 },
  eyebrow: { fontSize: 13, fontWeight: "600", lineHeight: 21 },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 15, lineHeight: 24 },
  card: { padding: 20, borderWidth: 1, borderRadius: 24, gap: 14 },
  form: { gap: 20 },
  forgotLink: {
    alignSelf: "flex-end",
    minHeight: 44,
    justifyContent: "center",
    marginTop: -16,
  },
  linkText: { fontSize: 14, fontWeight: "700", lineHeight: 22 },
  primaryButton: {
    borderRadius: 16,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  biometric: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: -10,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  line: { flex: 1, height: 1 },
  or: { fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  externalRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  outlineButton: {
    flexGrow: 1,
    flexBasis: 120,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  outlineText: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
  externalHint: { fontSize: 11, lineHeight: 18, textAlign: "center" },
  message: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  messageText: { flex: 1, fontSize: 13, lineHeight: 21 },
  notice: { fontSize: 13, lineHeight: 21, borderRadius: 12, padding: 12 },
  footer: { gap: 6 },
  switchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 7,
  },
  textButton: { minHeight: 44, justifyContent: "center" },
  footerText: { fontSize: 14, lineHeight: 22 },
  guestButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  demoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  demoText: { flex: 1, fontSize: 11, lineHeight: 19 },
});

