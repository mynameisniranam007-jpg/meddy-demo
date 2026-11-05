import React, { useMemo } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BodyText, Eyebrow, IconButton, Pill, PrimaryButton, Screen, SectionTitle, SurfaceCard } from '@/components/UI';
import { useColors } from '@/hooks/useColors';
import { useMedtriage } from '@/context/MedtriageContext';

const examples: Record<string, { name: string; en: string }[]> = {
  'ศีรษะ': [{ name: 'ปวดศีรษะจากความเครียด', en: 'Tension-type pattern' }, { name: 'ไมเกรน', en: 'Migraine pattern' }, { name: 'ปวดศีรษะที่ควรประเมินเร่งด่วน', en: 'Urgent headache warning example' }],
  'คอ': [{ name: 'ระคายคอจากการติดเชื้อทั่วไป', en: 'Throat irritation pattern' }, { name: 'คออักเสบ', en: 'Sore throat pattern' }, { name: 'หายใจหรือกลืนลำบาก', en: 'Urgent throat warning example' }],
  'หน้าอก': [{ name: 'กล้ามเนื้อบริเวณหน้าอกตึง', en: 'Chest wall discomfort' }, { name: 'อาการกรดไหลย้อน', en: 'Reflux-like pattern' }, { name: 'เจ็บแน่นหน้าอกที่ควรรีบประเมิน', en: 'Urgent chest warning example' }],
  'ท้อง': [{ name: 'อาหารไม่ย่อย', en: 'Indigestion pattern' }, { name: 'ระคายเคืองทางเดินอาหาร', en: 'Digestive irritation pattern' }, { name: 'ปวดท้องรุนแรงที่ควรประเมินเร่งด่วน', en: 'Urgent abdominal warning example' }],
  'หลัง': [{ name: 'กล้ามเนื้อหลังตึง', en: 'Back muscle strain pattern' }, { name: 'ปวดหลังจากท่าทางการใช้งาน', en: 'Posture-related back pain' }, { name: 'ปวดหลังร่วมกับอ่อนแรงหรือชา', en: 'Urgent back warning example' }],
  'แขน/มือ': [{ name: 'กล้ามเนื้อแขนล้า', en: 'Arm muscle fatigue' }, { name: 'เอ็นหรือข้อบริเวณแขนระคายเคือง', en: 'Arm joint irritation' }, { name: 'แขนอ่อนแรงเฉียบพลันที่ควรรีบประเมิน', en: 'Urgent arm warning example' }],
  'ขา/เท้า': [{ name: 'กล้ามเนื้อขาล้า', en: 'Leg muscle fatigue' }, { name: 'ข้อเท้าหรือเท้าระคายเคือง', en: 'Foot and ankle irritation' }, { name: 'ขาบวมเจ็บมากที่ควรประเมินเร่งด่วน', en: 'Urgent leg warning example' }],
  'ทั่วไป': [{ name: 'อ่อนเพลียชั่วคราว', en: 'Temporary fatigue pattern' }, { name: 'อาการคล้ายการติดเชื้อทั่วไป', en: 'Common infection-like pattern' }, { name: 'อาการที่ควรได้รับการประเมินเร่งด่วน', en: 'Urgent warning example' }],
};
const levels = [
  { label: 'เร่งด่วน', color: '#C83832', pale: '#FCE8E7', score: 3 },
  { label: 'ปานกลาง', color: '#A56A00', pale: '#FFF2D5', score: 2 },
  { label: 'น้อย', color: '#238052', pale: '#DCF5E8', score: 1 },
];

export default function ResultsScreen() {
  const colors = useColors();
  const { symptoms, bodyParts, photoUri } = useMedtriage();
  const area = bodyParts.find((part) => examples[part]) ?? inferArea(symptoms) ?? 'ทั่วไป';
  const candidates = useMemo(() => {
    const shuffled = [...examples[area]].sort(() => Math.random() - 0.5);
    const shuffledLevels = [...levels].sort(() => Math.random() - 0.5);
    return shuffled.map((condition, index) => ({ ...condition, level: shuffledLevels[index], percent: 12 + Math.floor(Math.random() * 77) }));
  }, [area]);
  const priority = candidates.reduce((highest, item) => item.level.score > highest.score ? item.level : highest, levels[2]);
  const urgent = priority.score === 3;
  const colorscale = ['#32A66A','#8BBF48','#E4BB3E','#E98638','#D94B45'];
  const activeScaleIndex = priority.score === 3 ? 4 : priority.score === 2 ? 2 : 0;

  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.header}><IconButton icon="arrow-left" label="ย้อนกลับ" onPress={() => router.back()} /><View style={styles.headerCopy}><Eyebrow>สรุปผลตัวอย่าง</Eyebrow><Text style={[styles.headerTitle, { color: colors.foreground }]}>ผลประเมินอาการ</Text></View><View style={{ width: 44 }} /></View>
      <View style={[styles.demoBanner, { backgroundColor: colors.secondary }]}><Feather name="info" size={16} color={colors.secondaryForeground} /><Text style={[styles.demoText, { color: colors.secondaryForeground }]}>ตัวอย่างแบบสุ่มสำหรับสาธิต ไม่ได้วิเคราะห์อาการจริงหรือใช้แทนคำวินิจฉัย</Text></View>
      <SurfaceCard style={styles.severityCard}>
        <View style={styles.severityTop}><View style={[styles.severityIcon,{backgroundColor:priority.pale}]}><Feather name={urgent?'alert-triangle':'activity'} size={21} color={priority.color}/></View><View style={styles.severityCopy}><Text style={[styles.cardKicker,{color:colors.mutedForeground}]}>ระดับสูงสุดในชุดตัวอย่าง · {area}</Text><Text style={[styles.severityTitle,{color:colors.foreground}]}>{urgent?'มีตัวอย่างที่ควรประเมินเร่งด่วน':priority.score===2?'ตัวอย่างระดับปานกลาง':'ตัวอย่างระดับน้อย'}</Text></View><View style={[styles.riskPill,{backgroundColor:priority.pale}]}><Text style={[styles.riskPillText,{color:priority.color}]}>{priority.label}</Text></View></View>
        <View style={styles.progressTrack}>{colorscale.map((color,index)=><View key={index} style={[styles.progressSegment,{backgroundColor:color,opacity:index===activeScaleIndex?1:0.35}]} />)}</View>
        <View style={styles.scaleLabels}><Text style={[styles.scaleText,{color:'#238052'}]}>น้อย</Text><Text style={[styles.scaleText,{color:'#A56A00'}]}>ปานกลาง</Text><Text style={[styles.scaleText,{color:'#C83832'}]}>เร่งด่วน</Text></View>
      </SurfaceCard>
      <SectionTitle title={`ตัวอย่างที่เป็นไปได้บริเวณ${area}`} detail="สลับตัวอย่างและระดับความเร่งด่วนในแต่ละครั้งที่เปิดผล" />
      {candidates.map((item,index)=><SurfaceCard key={`${item.name}-${index}`} style={styles.diagnosisCard}>
        <View style={styles.diagnosisRow}><View style={[styles.conditionIcon,{backgroundColor:item.level.pale}]}><Feather name={item.level.score===3?'alert-triangle':item.level.score===2?'activity':'check-circle'} size={20} color={item.level.color}/></View><View style={styles.conditionCopy}><Text style={[styles.conditionName,{color:colors.foreground}]}>{item.name}</Text><Text style={[styles.conditionEnglish,{color:colors.mutedForeground}]}>{item.en} · ตัวอย่าง</Text></View><View style={[styles.riskPill,{backgroundColor:item.level.pale}]}><Text style={[styles.riskPillText,{color:item.level.color}]}>{item.level.label}</Text></View></View>
        <View style={[styles.riskRow,{borderTopColor:colors.border}]}><Text style={[styles.riskLabel,{color:colors.mutedForeground}]}>คะแนนสุ่มสำหรับหน้าสาธิต</Text><Text style={[styles.riskValue,{color:item.level.color}]}>{item.percent}%</Text></View>
      </SurfaceCard>)}
      <SurfaceCard style={styles.missingCard}><View style={styles.missingHeading}><Feather name="help-circle" size={18} color="#A46B05"/><Text style={[styles.missingTitle,{color:colors.foreground}]}>ข้อมูลที่ยังไม่ครบ</Text></View><Text style={[styles.missingText,{color:colors.mutedForeground}]}>ตัวอย่างนี้ไม่ได้ประเมินจากประวัติสุขภาพ การตรวจร่างกาย หรือข้อมูลทางการแพทย์ ใช้ประกอบการนำเสนอเท่านั้น</Text><View style={styles.summaryTags}>{symptoms.trim()?<Pill tone="blue">บันทึกข้อความแล้ว</Pill>:null}{bodyParts.map(part=><Pill key={part} tone="neutral">{part}</Pill>)}{photoUri?<Pill tone="neutral">แนบภาพตัวอย่าง</Pill>:null}</View></SurfaceCard>
      <View style={[styles.disclaimer,{backgroundColor:'#FFF4DE',borderColor:'#F0D9A5'}]}><Feather name="alert-triangle" size={17} color="#8C5D00"/><View style={styles.disclaimerCopy}><Text style={styles.disclaimerTitle}>ข้อควรทราบ</Text><Text style={styles.disclaimerBody}>หากมีอาการรุนแรงหรือฉุกเฉิน ให้ติดต่อบริการฉุกเฉินหรือบุคลากรทางการแพทย์ทันที</Text></View></View>
      <PrimaryButton title="ค้นหาโรงพยาบาลใกล้ฉัน" icon="map-pin" onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);router.push('/recommended-hospitals');}} testID="find-nearby-hospitals" />
      <PrimaryButton title="ปรึกษานักศึกษาแพทย์" icon="message-circle" onPress={()=>router.push('/telemedicine')} testID="consult-medical-student" />
      <Pressable accessibilityRole="button" onPress={()=>router.push('/triage')} style={styles.editLink}><Text style={[styles.editText,{color:colors.secondaryForeground}]}>กลับไปแก้ไขข้อมูลตัวอย่าง</Text></Pressable>
      <BodyText style={styles.emergencyNote}>แอปนี้เป็นเดโม ไม่ใช่เครื่องมือวินิจฉัยหรือคัดกรองทางการแพทย์</BodyText>
    </Screen>
  );
}

function inferArea(text: string) {
  if (/หัว|ศีรษะ|ไมเกรน/.test(text)) return 'ศีรษะ';
  if (/คอ|กลืน/.test(text)) return 'คอ';
  if (/หน้าอก|หายใจ|ไอ/.test(text)) return 'หน้าอก';
  if (/ท้อง|ท้องเสีย|คลื่นไส้/.test(text)) return 'ท้อง';
  if (/หลัง/.test(text)) return 'หลัง';
  return null;
}

const styles=StyleSheet.create({page:{gap:17},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headerCopy:{alignItems:'center',gap:3},headerTitle:{fontSize:19,fontWeight:'800'},demoBanner:{minHeight:43,paddingHorizontal:12,borderRadius:13,flexDirection:'row',alignItems:'center',gap:9},demoText:{flex:1,fontSize:12,lineHeight:18,fontWeight:'600'},severityCard:{gap:15},severityTop:{flexDirection:'row',alignItems:'center',gap:11},severityIcon:{width:42,height:42,borderRadius:15,alignItems:'center',justifyContent:'center'},severityCopy:{flex:1,gap:4},cardKicker:{fontSize:11},severityTitle:{fontSize:14,fontWeight:'800'},progressTrack:{height:9,flexDirection:'row',gap:3,overflow:'hidden'},progressSegment:{flex:1,borderRadius:6},riskPill:{borderRadius:20,paddingHorizontal:10,paddingVertical:6},riskPillText:{fontSize:10,fontWeight:'800'},scaleLabels:{flexDirection:'row',justifyContent:'space-between'},scaleText:{fontSize:11,fontWeight:'700'},diagnosisCard:{gap:13},diagnosisRow:{flexDirection:'row',alignItems:'center',gap:11},conditionIcon:{width:44,height:44,borderRadius:15,alignItems:'center',justifyContent:'center'},conditionCopy:{flex:1,gap:3},conditionName:{fontSize:14,fontWeight:'800',lineHeight:20},conditionEnglish:{fontSize:10,lineHeight:15},riskRow:{borderTopWidth:1,paddingTop:11,flexDirection:'row',justifyContent:'space-between',gap:12},riskLabel:{fontSize:11},riskValue:{fontSize:12,fontWeight:'800'},missingCard:{gap:10},missingHeading:{flexDirection:'row',alignItems:'center',gap:8},missingTitle:{fontSize:14,fontWeight:'700'},missingText:{fontSize:12,lineHeight:19},summaryTags:{flexDirection:'row',flexWrap:'wrap',gap:6},disclaimer:{borderWidth:1,padding:14,borderRadius:17,flexDirection:'row',alignItems:'flex-start',gap:10},disclaimerCopy:{flex:1,gap:4},disclaimerTitle:{color:'#6E4A08',fontSize:13,fontWeight:'800'},disclaimerBody:{color:'#6E4A08',fontSize:12,lineHeight:19},editLink:{alignSelf:'center',minHeight:38,justifyContent:'center'},editText:{fontSize:13,fontWeight:'700'},emergencyNote:{textAlign:'center',fontSize:11,lineHeight:17}});
