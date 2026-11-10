import { formatNationalId } from "@/constants/profile";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { Text } from "react-native";
import {
  Screen,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  BodyText,
} from "@/components/UI";
import { AuthField } from "@/components/AuthField";
import {
  cancelRecovery,
  isDemoAuth,
  requestOtp,
  verifyOtp,
  resetPassword,
} from "@/utils/auth";
export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<"request" | "otp" | "reset" | "done">(
    "request",
  );
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [token, setToken] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => () => cancelRecovery(), []);
  const act = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (step === "request") {
        const data = await requestOtp(identifier);
        setChallengeId(data.challengeId);
        setDemoOtp(data.demoOtp ?? "");
        setCooldown(30);
        setStep("otp");
      } else if (step === "otp") {
        const data = await verifyOtp(challengeId, otp);
        setToken(data.resetToken);
        setOtp("");
        setDemoOtp("");
        setStep("reset");
      } else if (step === "reset") {
        if (password !== confirm)
          throw new Error("รหัสผ่านทั้งสองช่องต้องตรงกัน");
        await resetPassword(token, password);
        setPassword("");
        setConfirm("");
        setToken("");
        setStep("done");
        setIdentifier("");
        setChallengeId("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ทำรายการไม่ได้ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen contentStyle={{ gap: 18 }}>
      <SectionTitle
        title={
          step === "request"
            ? "กู้คืนรหัสผ่าน"
            : step === "otp"
              ? "ยืนยัน OTP 6 หลัก"
              : step === "reset"
                ? "ตั้งรหัสผ่านใหม่"
                : "ตั้งรหัสผ่านสำเร็จ"
        }
      />
      <SurfaceCard style={{ gap: 18 }}>
        {isDemoAuth ? (
          <BodyText>
            เดโมไม่ส่ง SMS/อีเมลจริง ใช้บัญชีทดลองที่บันทึกในอุปกรณ์นี้
            รหัสทดลองมีอายุ 5 นาที กรอกผิดได้ไม่เกิน 5 ครั้ง
          </BodyText>
        ) : null}
        {step === "request" ? (
          <AuthField
            label="เลขบัตรประชาชนของบัญชีที่ต้องการกู้คืน"
            value={formatNationalId(identifier)}
            onChangeText={(value) =>
              setIdentifier(value.replace(/\D/g, "").slice(0, 13))
            }
            numeric
            maxLength={17}
          />
        ) : null}
        {step === "otp" ? (
          <>
            <BodyText>
              หากข้อมูลตรงกับบัญชี
              ระบบจะส่งรหัสไปยังช่องทางติดต่อที่ลงทะเบียนไว้
              โปรดตรวจสอบช่องทางที่เลือก
            </BodyText>
            {demoOtp ? (
              <Text selectable style={{ color: "#176B68", fontSize: 18 }}>
                OTP ทดลอง: {demoOtp}
              </Text>
            ) : null}
            <AuthField
              label="OTP 6 หลัก"
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
              numeric
              maxLength={6}
            />
            <SecondaryButton
              title={cooldown ? `ขอใหม่ได้ใน ${cooldown} วินาที` : "ขอรหัสใหม่"}
              disabled={busy || cooldown > 0}
              onPress={() => {
                cancelRecovery();
                setOtp("");
                setError("");
                setStep("request");
              }}
            />
          </>
        ) : null}
        {step === "reset" ? (
          <>
            <AuthField
              label="รหัสผ่านใหม่"
              value={password}
              onChangeText={setPassword}
              password
              maxLength={128}
            />
            <AuthField
              label="ยืนยันรหัสผ่านใหม่"
              value={confirm}
              onChangeText={setConfirm}
              password
              maxLength={128}
            />
          </>
        ) : null}
        {error ? (
          <Text accessibilityRole="alert" style={{ color: "#B4232D" }}>
            {error}
          </Text>
        ) : null}
        {step !== "done" ? (
          <PrimaryButton
            title={
              step === "request"
                ? "ขอรับ OTP"
                : step === "otp"
                  ? "ยืนยันรหัส OTP"
                  : "บันทึกรหัสผ่านใหม่"
            }
            onPress={() => void act()}
            loading={busy}
          />
        ) : (
          <PrimaryButton
            title="บันทึกแล้ว · เข้าสู่ระบบด้วยรหัสผ่านใหม่"
            onPress={() => router.replace("/login")}
          />
        )}
      </SurfaceCard>
      <SecondaryButton
        title="กลับไปเข้าสู่ระบบ"
        onPress={() => router.replace("/login")}
        disabled={busy}
      />
    </Screen>
  );
}
