import React, { useState } from "react";
import { router } from "expo-router";
import { Alert, Text } from "react-native";
import {
  Screen,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  BodyText,
} from "@/components/UI";
import { AuthField } from "@/components/AuthField";
import { isDemoAuth, registerAccount, signIn } from "@/utils/auth";
import { biometricSession } from "@/utils/biometrics";
import { useMedtriage } from "@/context/MedtriageContext";
export default function AccountScreen({
  register = false,
}: {
  register?: boolean;
}) {
  const { authenticate } = useMedtriage();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (biometric = false) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (register && password !== confirm)
        throw new Error("รหัสผ่านทั้งสองช่องต้องตรงกัน");
      const session = biometric
        ? await biometricSession()
        : register
          ? await registerAccount(identifier, password, name)
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
  return (
    <Screen contentStyle={{ gap: 18 }}>
      <SectionTitle
        title={register ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        detail="เติมข้อมูลบัญชี แล้วกลับไปยังรายการที่เลือกไว้"
      />
      <SurfaceCard style={{ gap: 18 }}>
        {isDemoAuth ? (
          <BodyText>
            บัญชีทดลองบันทึกในอุปกรณ์นี้และใช้ต่อหลังรีโหลดได้
            กรุณาใช้ข้อมูลและรหัสผ่านสมมติ
          </BodyText>
        ) : null}
        {register ? (
          <AuthField
            label="ชื่อที่ใช้แสดง / ชื่อผู้ดูแล"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        ) : null}
        <AuthField
          label="อีเมลหรือเบอร์โทรศัพท์"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <AuthField
          label="รหัสผ่าน 8–128 ตัวอักษร"
          value={password}
          onChangeText={setPassword}
          password
          maxLength={128}
        />
        {register ? (
          <AuthField
            label="ยืนยันรหัสผ่าน"
            value={confirm}
            onChangeText={setConfirm}
            password
            maxLength={128}
          />
        ) : null}
        {error ? (
          <Text accessibilityRole="alert" style={{ color: "#B4232D" }}>
            {error}
          </Text>
        ) : null}
        <PrimaryButton
          title={register ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
          onPress={() => void submit()}
          loading={busy}
        />
        {!register ? (
          <>
            <SecondaryButton
              title="ลืมรหัสผ่าน"
              onPress={() => {
                setPassword("");
                router.push("/forgot-password");
              }}
              disabled={busy}
            />
            <SecondaryButton
              title="Face ID / Touch ID"
              onPress={() => void submit(true)}
              disabled={busy}
            />
          </>
        ) : null}
      </SurfaceCard>
      <SurfaceCard style={{ gap: 12 }}>
        <BodyText>ตัวเลือกยืนยันตัวตนภายนอก</BodyText>
        <SecondaryButton
          title="ThaID · ยังไม่เชื่อมต่อ"
          onPress={() =>
            Alert.alert(
              "ThaID",
              "ต้นแบบนี้ยังไม่เชื่อมต่อบริการยืนยันตัวตนจริง",
            )
          }
        />
        <SecondaryButton
          title="หมอพร้อม · ยังไม่เชื่อมต่อ"
          onPress={() =>
            Alert.alert(
              "หมอพร้อม",
              "ต้นแบบนี้ยังไม่เชื่อมต่อบริการยืนยันตัวตนจริง",
            )
          }
        />
      </SurfaceCard>
      <SecondaryButton
        title={
          register ? "มีบัญชีแล้ว เข้าสู่ระบบ" : "ยังไม่มีบัญชี? สมัครสมาชิก"
        }
        onPress={() => {
          setPassword("");
          setConfirm("");
          router.replace(register ? "/login" : "/register");
        }}
      />
      <SecondaryButton
        title="คัดกรองอาการต่อโดยไม่สมัคร"
        onPress={() => router.replace("/triage")}
      />
    </Screen>
  );
}
