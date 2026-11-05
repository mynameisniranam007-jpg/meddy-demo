import React, { useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { BodyText, Eyebrow, IconButton, Pill, PrimaryButton, Screen, SurfaceCard } from '@/components/UI';
import { useColors } from '@/hooks/useColors';

export default function TelemedicineScreen() {
  const colors = useColors();
  const [provider, setProvider] = useState<'general' | 'resident' | null>(null);
  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" label="ย้อนกลับ" onPress={() => router.back()} />
        <View style={styles.headerCopy}>
          <Eyebrow>Telemedicine</Eyebrow>
          <Text style={[styles.title, { color: colors.foreground }]}>
            ปรึกษาแพทย์
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <SurfaceCard style={styles.infoCard}>
        <Text style={[styles.infoTitle,{color:colors.foreground}]}>เลือกประเภทแพทย์ก่อนโทร</Text>
        <PrimaryButton title="แพทย์ทั่วไป · ขณะนี้มีผู้ใช้จำนวนมาก อาจต้องรอสาย" icon="users" onPress={()=>setProvider('general')} />
        <PrimaryButton title="แพทย์ประจำบ้าน · คิวตัวอย่าง" icon="user" onPress={()=>setProvider('resident')} />
        {provider?<Text style={[styles.infoText,{color:colors.secondaryForeground}]}>เลือกแล้ว: {provider==='general'?'แพทย์ทั่วไป':'แพทย์ประจำบ้าน'} · ระบบโทรยังเป็นหน้าจอจำลอง</Text>:null}
      </SurfaceCard>
      {provider ? <>
      <View style={[styles.callPanel, { backgroundColor: colors.primary }]}>
        <View style={styles.callOrb} />
        <View style={styles.videoTile}>
          <View style={styles.doctorAvatar}>
            <Feather name="user" size={38} color={colors.secondaryForeground} />
          </View>
          <Text style={styles.tileTitle}>{provider === 'general' ? 'แพทย์ทั่วไปตัวอย่าง' : 'แพทย์ประจำบ้านตัวอย่าง'}</Text>
          <Text style={styles.tileSub}>หน้าจอสาธิต · ไม่ได้เชื่อมต่อผู้ให้บริการจริง</Text>
          <Pill tone="teal">ตัวอย่างหน้าจอ</Pill>
        </View>
        <View style={styles.callControls}>
          <View style={styles.controlCircle}>
            <Feather name="mic" size={18} color="#FFFFFF" />
          </View>
          <View style={[styles.controlCircle, styles.endCall]}>
            <Feather name="phone-off" size={19} color="#FFFFFF" />
          </View>
          <View style={styles.controlCircle}>
            <Feather name="video" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <SurfaceCard style={styles.infoCard}>
        <View style={styles.infoHeading}>
          <Feather name="info" size={18} color={colors.secondaryForeground} />
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>
            หน้านี้เป็นหน้าจอจำลอง ยังไม่ได้เชื่อมต่อแพทย์
          </Text>
        </View>
        <BodyText style={styles.infoText}>
          หน้านี้เป็นตัวอย่างการออกแบบ ไม่มีกล้องวิดีโอ เสียง หรือการปรึกษาทางการแพทย์
        </BodyText>
      </SurfaceCard>

      </> : <SurfaceCard style={styles.infoCard}><Text style={[styles.infoText,{color:colors.mutedForeground}]}>เลือกประเภทแพทย์ด้านบนก่อน เพื่อเข้าสู่หน้าจอวิดีโอคอลตัวอย่าง</Text></SurfaceCard>}

      <PrimaryButton
        title="กลับไปหน้าหลัก"
        icon="home"
        onPress={() => router.replace('/(tabs)')}
      />
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        หากต้องการคำปรึกษาจริง โปรดติดต่อสถานพยาบาลโดยตรง
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 19 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { alignItems: 'center', gap: 4 },
  title: { fontSize: 18, fontWeight: '800' },
  callPanel: { minHeight: 360, borderRadius: 25, padding: 18, alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  callOrb: { position: 'absolute', width: 250, height: 250, borderRadius: 125, right: -110, top: -90, backgroundColor: 'rgba(255,255,255,0.07)' },
  videoTile: { flex: 1, width: '100%', borderRadius: 20, backgroundColor: '#F2F7F7', alignItems: 'center', justifyContent: 'center', gap: 8 },
  doctorAvatar: { width: 83, height: 83, borderRadius: 30, backgroundColor: '#DDF3EF', alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  tileTitle: { color: '#0D2C54', fontSize: 16, fontWeight: '800' },
  tileSub: { color: '#6E8295', fontSize: 12 },
  callControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingTop: 18 },
  controlCircle: { width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.17)', alignItems: 'center', justifyContent: 'center' },
  endCall: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#C94343' },
  infoCard: { gap: 9 },
  infoHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTitle: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '800' },
  infoText: { fontSize: 12, lineHeight: 19 },
  footer: { textAlign: 'center', fontSize: 11, lineHeight: 17 },
});
