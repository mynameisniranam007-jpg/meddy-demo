import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  BodyText,
} from "@/components/UI";
import { AuthField } from "@/components/AuthField";
import { useMedtriage } from "@/context/MedtriageContext";
import { useColors } from "@/hooks/useColors";
export default function FamilyProfiles() {
  const {
    session,
    familyMembers,
    activePatientId,
    selectPatient,
    addFamilyMember,
  } = useMedtriage();
  const colors = useColors();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  if (!session) return null;
  return (
    <SurfaceCard style={{ gap: 14 }}>
      <Text
        style={{ fontSize: 17, fontWeight: "800", color: colors.foreground }}
      >
        กำลังดูแลใคร?
      </Text>
      {familyMembers.map((member) => (
        <Pressable
          key={member.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: member.id === activePatientId }}
          onPress={() => selectPatient(member.id)}
          style={{
            padding: 14,
            minHeight: 52,
            borderRadius: 12,
            borderWidth: 2,
            borderColor:
              member.id === activePatientId ? colors.primary : colors.border,
          }}
        >
          <Text style={{ fontSize: 16, color: colors.foreground }}>
            {member.id === activePatientId ? "● " : "○ "}
            {member.profile.fullName} · {member.relationship}
          </Text>
        </Pressable>
      ))}
      <SecondaryButton
        title={adding ? "ปิดแบบฟอร์ม" : "เพิ่มคนในครอบครัว"}
        onPress={() => {
          setAdding(!adding);
          setName("");
          setRelation("");
          setConsent(false);
          setError("");
        }}
      />
      {adding ? (
        <View style={{ gap: 14 }}>
          <AuthField
            label="ชื่อสมาชิกในครอบครัว"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
          <AuthField
            label="ความสัมพันธ์ เช่น บิดา มารดา"
            value={relation}
            onChangeText={setRelation}
            maxLength={50}
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
            onPress={() => setConsent(!consent)}
            style={{ padding: 12, minHeight: 48 }}
          >
            <Text style={{ color: colors.foreground, fontSize: 15 }}>
              {consent ? "☑" : "☐"}{" "}
              ฉันได้รับอนุญาตให้จัดการข้อมูลและจองแทนบุคคลนี้
            </Text>
          </Pressable>
          {error ? (
            <Text accessibilityRole="alert" style={{ color: "#B4232D" }}>
              {error}
            </Text>
          ) : null}
          <PrimaryButton
            title="เพิ่มสมาชิก"
            onPress={() => {
              try {
                addFamilyMember(name, relation, consent);
                setAdding(false);
                setName("");
                setRelation("");
                setConsent(false);
              } catch (e) {
                setError(e instanceof Error ? e.message : "เพิ่มสมาชิกไม่ได้");
              }
            }}
          />
        </View>
      ) : null}
      <BodyText>
        เดโมเก็บข้อมูลครอบครัวไว้ในหน่วยความจำชั่วคราว
        ล้างเมื่อออกจากระบบหรือรีโหลด
      </BodyText>
    </SurfaceCard>
  );
}
