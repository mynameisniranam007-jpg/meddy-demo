import React, { useMemo } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BodyText, Eyebrow, IconButton, Pill, PrimaryButton, Screen, SectionTitle, SurfaceCard } from '@/components/UI';
import { useColors } from '@/hooks/useColors';
import { useMedtriage } from '@/context/MedtriageContext';

const examples: Record<string, { name: string; detail: string; level: number }[]> = {
  'ศีรษะ': [
    { name: 'ปวดศีรษะจากความเครียด', detail: 'อาจพบร่วมกับพักผ่อนไม่พอหรือความเครียด หากปวดรุนแรงฉับพลันควรพบแพทย์', level: 1 },
    { name: 'ไมเกรน', detail: 'อาจมีปวดตุบ คลื่นไส้ หรือไวต่อแสง แต่ต้องให้บุคลากรประเมิน', level: 2 },
    { name: 'ปวดศีรษะร่วมไข้: ไข้หวัดใหญ่หรือโควิดเป็นตัวอย่างหนึ่ง', detail: 'ไข้และปวดศีรษะเกิดได้จากหลายสาเหตุ เช่น ไข้หวัดใหญ่หรือโควิด ต้องพิจารณาอาการอื่นและตรวจโดยบุคลากร', level: 2 },
    { name: 'ปวดศีรษะรุนแรงฉับพลัน', detail: 'อาการรุนแรงฉับพลันหรือมีแขนขาอ่อนแรงเป็นสัญญาณที่ควรได้รับการดูแลทันที', level: 3 },
  ],
  'คอ': [
    { name: 'ต่อมทอนซิลอักเสบ', detail: 'อาจมีเจ็บคอ กลืนเจ็บ และมีไข้ได้ สาเหตุมีได้หลายแบบ ควรประเมินโดยบุคลากร', level: 2 },
    { name: 'เสมหะและระคายคอ', detail: 'อาจสัมพันธ์กับการติดเชื้อทางเดินหายใจหรือการระคายเคือง หากหายใจลำบากให้รีบไปโรงพยาบาล', level: 1 },
    { name: 'เจ็บคอร่วมกับหายใจหรือกลืนลำบาก', detail: 'อาจเป็นสัญญาณอันตราย ควรไปโรงพยาบาลทันที', level: 3 },
  ],
  'หน้าอก': [
    { name: 'กรดไหลย้อน', detail: 'อาจมีแสบร้อนกลางอก แต่เจ็บแน่นหน้าอกอาจมีสาเหตุร้ายแรงได้', level: 2 },
    { name: 'กล้ามเนื้อหน้าอกตึง', detail: 'อาจสัมพันธ์กับการใช้งานกล้ามเนื้อ หากเจ็บแน่นหรือหายใจไม่สะดวกให้รีบประเมิน', level: 1 },
    { name: 'เจ็บแน่นหน้าอกรุนแรง', detail: 'ควรไปห้องฉุกเฉินทันที โดยเฉพาะเมื่อหอบ เหงื่อแตก หรือหน้ามืด', level: 3 },
  ],
  'ท้อง': [
    { name: 'อาหารไม่ย่อย', detail: 'อาจมีแน่นท้องหรือคลื่นไส้ หากปวดมากหรืออาเจียนไม่หยุดควรพบแพทย์', level: 1 },
    { name: 'กระเพาะหรือลำไส้อักเสบ', detail: 'อาจมีปวดท้อง ถ่ายเหลว หรือไข้ ควรเฝ้าระวังภาวะขาดน้ำ', level: 2 },
    { name: 'ปวดท้องรุนแรงเฉียบพลัน', detail: 'ควรไปโรงพยาบาลทันที โดยเฉพาะเมื่อมีหน้ามืดหรืออาเจียนเป็นเลือด', level: 3 },
  ],
  'หลัง': [
    { name: 'กล้ามเนื้อหลังตึง', detail: 'อาจสัมพันธ์กับท่าทางหรือการยกของ หากมีชา/อ่อนแรงควรรีบประเมิน', level: 1 },
    { name: 'ปวดหลังร้าวลงขา', detail: 'ควรให้บุคลากรประเมิน โดยเฉพาะเมื่อมีอาการชาหรืออ่อนแรงร่วมด้วย', level: 2 },
    { name: 'ปวดหลังร่วมกับขาอ่อนแรง', detail: 'ควรไปโรงพยาบาลโดยเร็วเพื่อรับการประเมิน', level: 3 },
  ],
  'แขน/มือ': [
    { name: 'กล้ามเนื้อแขนล้า', detail: 'พักการใช้งานและสังเกตอาการ หากอ่อนแรงฉับพลันให้รีบไปโรงพยาบาล', level: 1 },
    { name: 'ปวดข้อหรือเอ็น', detail: 'อาจเกิดจากการใช้งานหรือบาดเจ็บ ควรประเมินหากบวมมากหรือขยับไม่ได้', level: 2 },
    { name: 'แขนอ่อนแรงฉับพลัน', detail: 'อาจเป็นสัญญาณฉุกเฉิน โดยเฉพาะเมื่อหน้าเบี้ยวหรือพูดไม่ชัด โทร 1669', level: 3 },
  ],
  'ขา/เท้า': [
    { name: 'กล้ามเนื้อขาล้า', detail: 'พักและสังเกตอาการ หากบวมแดงหรือเจ็บมากขึ้นให้พบแพทย์', level: 1 },
    { name: 'ข้อเท้าแพลง', detail: 'หากลงน้ำหนักไม่ได้หรือบวมมากควรรับการประเมิน', level: 2 },
    { name: 'ขาบวมเจ็บมากเฉียบพลัน', detail: 'ควรไปโรงพยาบาลทันที โดยเฉพาะเมื่อมีหอบหรือเจ็บหน้าอก', level: 3 },
  ],
  'ทั่วไป': [
    { name: 'อ่อนเพลียชั่วคราว', detail: 'พักผ่อนและดื่มน้ำ หากอาการไม่ดีขึ้นหรือแย่ลงควรพบแพทย์', level: 1 },
    { name: 'อาการคล้ายไข้หวัดหรือโควิด', detail: 'ไข้ ไอ และเจ็บคอพบได้จากหลายสาเหตุ ควรตรวจและปฏิบัติตามคำแนะนำบุคลากร', level: 2 },
    { name: 'ไข้สูงร่วมกับซึมหรือหายใจลำบาก', detail: 'ควรไปโรงพยาบาลทันที หรือโทร 1669 หากเดินทางเองไม่ปลอดภัย', level: 3 },
  ],
};
const levels = [
  { label: 'เร่งด่วน', color: '#C83832', pale: '#FCE8E7', score: 3 },
  { label: 'ปานกลาง', color: '#A56A00', pale: '#FFF2D5', score: 2 },
  { label: 'เบื้องต้น', color: '#238052', pale: '#DCF5E8', score: 1 },
];

export default function ResultsScreen() {
  const colors = useColors();
  const { symptoms, bodyParts, photoUri } = useMedtriage();
  const area = bodyParts.find((part) => examples[part]) ?? inferArea(symptoms) ?? 'ทั่วไป';
  const sample = useMemo(() => {
    const pool = examples[area];
    return pool[Math.floor(Math.random() * pool.length)];
  }, [area]);
  const priority = levels.find((level) => level.score === sample.level) ?? levels[0];
  const urgent = sample.level === 3;

  return (
    <Screen contentStyle={styles.page}>
      <View style={styles.header}><IconButton icon="arrow-left" label="ย้อนกลับ" onPress={() => router.back()} /><View style={styles.headerCopy}><Eyebrow>ตัวอย่างเพื่อสาธิต</Eyebrow><Text style={[styles.headerTitle, { color: colors.foreground }]}>ผลประเมินอาการ</Text></View><View style={{ width: 44 }} /></View>
      <View style={[styles.demoBanner, { backgroundColor: colors.secondary }]}><Feather name="info" size={16} color={colors.secondaryForeground} /><Text style={[styles.demoText, { color: colors.secondaryForeground }]}>สุ่มตัวอย่างตามบริเวณอาการ ไม่ใช่ผลวินิจฉัยหรือการประเมินทางการแพทย์จริง</Text></View>
      {urgent ? <View accessibilityRole="alert" style={styles.urgentBanner}><Feather name="alert-triangle" size={28} color="#FFFFFF"/><Text style={styles.urgentTitle}>ควรไปโรงพยาบาลทันที</Text><Text style={styles.urgentBody}>{sample.detail}</Text><Text style={styles.urgentBody}>หากเป็นเหตุฉุกเฉิน โทร 1669</Text></View> : null}
      <SurfaceCard style={styles.severityCard}>
        <View style={styles.severityTop}><View style={[styles.severityIcon,{backgroundColor:priority.pale}]}><Feather name={urgent?'alert-triangle':'activity'} size={21} color={priority.color}/></View><View style={styles.severityCopy}><Text style={[styles.cardKicker,{color:colors.mutedForeground}]}>ตัวอย่างบริเวณ · {area}</Text><Text style={[styles.severityTitle,{color:colors.foreground}]}>{sample.name}</Text></View><View style={[styles.riskPill,{backgroundColor:priority.pale}]}><Text style={[styles.riskPillText,{color:priority.color}]}>{priority.label}</Text></View></View>
        <Text style={[styles.sampleDetail,{color:colors.foreground}]}>{sample.detail}</Text>
        <View style={styles.progressTrack}>{['#32A66A','#8BBF48','#E4BB3E','#E98638','#D94B45'].map((color,index)=><View key={index} style={[styles.progressSegment,{backgroundColor:color,opacity:index===(sample.level===3?4:sample.level===2?2:0)?1:0.32}]}/>)}</View>
        <View style={styles.scaleLabels}><Text style={[styles.scaleText,{color:'#238052'}]}>น้อย</Text><Text style={[styles.scaleText,{color:'#A56A00'}]}>ปานกลาง</Text><Text style={[styles.scaleText,{color:'#C83832'}]}>เร่งด่วน</Text></View>
      </SurfaceCard>
      <SurfaceCard style={styles.missingCard}><View style={styles.missingHeading}><Feather name="help-circle" size={18} color="#A46B05"/><Text style={[styles.missingTitle,{color:colors.foreground}]}>ข้อมูลประกอบ</Text></View><Text style={[styles.missingText,{color:colors.mutedForeground}]}>ผลนี้สุ่มจากตัวอย่างตามบริเวณที่เลือก ไม่ได้วิเคราะห์อาการจริง{symptoms.trim() ? ' และไม่ได้ตรวจสอบข้อความอาการ' : ''} ใช้เพื่อสาธิตเท่านั้น</Text><View style={styles.summaryTags}>{symptoms.trim()?<Pill tone="blue">มีข้อความอาการ</Pill>:null}{bodyParts.map(part=><Pill key={part} tone="neutral">{part}</Pill>)}{photoUri?<Pill tone="neutral">แนบภาพตัวอย่าง</Pill>:null}</View></SurfaceCard>
      {!urgent ? <View style={[styles.disclaimer,{backgroundColor:'#FFF4DE',borderColor:'#F0D9A5'}]}><Feather name="alert-triangle" size={17} color="#8C5D00"/><View style={styles.disclaimerCopy}><Text style={styles.disclaimerTitle}>ข้อควรทราบ</Text><Text style={styles.disclaimerBody}>หากอาการรุนแรงขึ้น หายใจลำบาก หมดสติ หรือเจ็บหน้าอกรุนแรง ให้โทร 1669 หรือไปห้องฉุกเฉิน</Text></View></View> : null}
      <PrimaryButton title={urgent ? "ดูโรงพยาบาลใกล้เคียง" : "ค้นหาโรงพยาบาล"} icon="map-pin" onPress={()=>{Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);router.push({pathname:'/recommended-hospitals',params:{urgent:urgent?'1':'0'}});}} testID="find-nearby-hospitals" />
      <PrimaryButton title="ปรึกษาผู้ให้คำปรึกษา" icon="message-circle" onPress={()=>router.push('/telemedicine')} testID="consult-medical-student" />
      <Pressable accessibilityRole="button" onPress={()=>router.push('/triage')} style={styles.editLink}><Text style={[styles.editText,{color:colors.secondaryForeground}]}>กลับไปแก้ไขข้อมูลตัวอย่าง</Text></Pressable>
      <BodyText style={styles.emergencyNote}>หากมีเหตุฉุกเฉิน โทร 1669 · เดโมนี้ไม่ใช่เครื่องมือวินิจฉัย</BodyText>
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

const styles=StyleSheet.create({page:{gap:17},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headerCopy:{alignItems:'center',gap:3},headerTitle:{fontSize:19,fontWeight:'800'},demoBanner:{minHeight:43,paddingHorizontal:12,borderRadius:13,flexDirection:'row',alignItems:'center',gap:9},demoText:{flex:1,fontSize:12,lineHeight:18,fontWeight:'600'},urgentBanner:{backgroundColor:'#B4232D',borderRadius:18,padding:20,gap:9,alignItems:'center'},urgentTitle:{color:'#FFFFFF',fontSize:23,fontWeight:'900',textAlign:'center'},urgentBody:{color:'#FFFFFF',fontSize:15,lineHeight:23,textAlign:'center'},sampleDetail:{fontSize:14,lineHeight:22},severityCard:{gap:15},severityTop:{flexDirection:'row',alignItems:'center',gap:11},severityIcon:{width:42,height:42,borderRadius:15,alignItems:'center',justifyContent:'center'},severityCopy:{flex:1,gap:4},cardKicker:{fontSize:11},severityTitle:{fontSize:14,fontWeight:'800'},progressTrack:{height:9,flexDirection:'row',gap:3,overflow:'hidden'},progressSegment:{flex:1,borderRadius:6},riskPill:{borderRadius:20,paddingHorizontal:10,paddingVertical:6},riskPillText:{fontSize:10,fontWeight:'800'},scaleLabels:{flexDirection:'row',justifyContent:'space-between'},scaleText:{fontSize:11,fontWeight:'700'},diagnosisCard:{gap:13},diagnosisRow:{flexDirection:'row',alignItems:'center',gap:11},conditionIcon:{width:44,height:44,borderRadius:15,alignItems:'center',justifyContent:'center'},conditionCopy:{flex:1,gap:3},conditionName:{fontSize:14,fontWeight:'800',lineHeight:20},conditionEnglish:{fontSize:10,lineHeight:15},riskRow:{borderTopWidth:1,paddingTop:11,flexDirection:'row',justifyContent:'space-between',gap:12},riskLabel:{fontSize:11},riskValue:{fontSize:12,fontWeight:'800'},missingCard:{gap:10},missingHeading:{flexDirection:'row',alignItems:'center',gap:8},missingTitle:{fontSize:14,fontWeight:'700'},missingText:{fontSize:12,lineHeight:19},summaryTags:{flexDirection:'row',flexWrap:'wrap',gap:6},disclaimer:{borderWidth:1,padding:14,borderRadius:17,flexDirection:'row',alignItems:'flex-start',gap:10},disclaimerCopy:{flex:1,gap:4},disclaimerTitle:{color:'#6E4A08',fontSize:13,fontWeight:'800'},disclaimerBody:{color:'#6E4A08',fontSize:12,lineHeight:19},editLink:{alignSelf:'center',minHeight:38,justifyContent:'center'},editText:{fontSize:13,fontWeight:'700'},emergencyNote:{textAlign:'center',fontSize:11,lineHeight:17}});
