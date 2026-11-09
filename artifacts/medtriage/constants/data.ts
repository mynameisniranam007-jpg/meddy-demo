export type Hospital = {
  id: string;
  name: string;
  kind: 'โรงพยาบาลรัฐ' | 'โรงพยาบาลเอกชน';
  category: 'general' | 'specialty';
  specialty: string;
  phone: string;
  department: string;
  doctor: string;
  cost: string;
  costNote: string;
  latitude: number;
  longitude: number;
  area: string;
  photoUrl?: string;
  photoCredit?: string;
  photoPage?: string;
};

const demoCost = 'ตัวเลขสมมติสำหรับการนำเสนอ';

export const hospitals: Hospital[] = [
  {
    id: 'thammasat', name: 'โรงพยาบาลธรรมศาสตร์เฉลิมพระเกียรติ', kind: 'โรงพยาบาลรัฐ', category: 'general',
    specialty: 'โรงพยาบาลมหาวิทยาลัย ดูแลรักษาโรคทั่วไปและเฉพาะทาง', phone: '02-926-9999', department: 'อายุรกรรมทั่วไป',
    doctor: 'ทีมแพทย์ตัวอย่าง', cost: 'ประมาณ 200–800 บาท', costNote: demoCost,
    latitude: 14.07346, longitude: 100.61561, area: 'คลองหลวง · ปทุมธานี',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Thammasat_University_Hospital.jpg', photoCredit: 'Sry85 · CC BY-SA 4.0 · Wikimedia Commons', photoPage: 'https://commons.wikimedia.org/wiki/File:Thammasat_University_Hospital.jpg',
  },
  {
    id: 'phatara', name: 'โรงพยาบาลภัทร-ธนบุรี', kind: 'โรงพยาบาลเอกชน', category: 'general',
    specialty: 'ตรวจรักษาโรคทั่วไปและคลินิกเฉพาะทาง', phone: '02-901-8400', department: 'อายุรกรรมทั่วไป',
    doctor: 'ทีมแพทย์ตัวอย่าง', cost: 'ประมาณ 700–1,500 บาท', costNote: demoCost,
    latitude: 14.048791, longitude: 100.618081, area: 'คลองหลวง · ปทุมธานี',
    photoUrl: 'https://gis-health.moph.go.th/healthmap/upload/logo/p_14354_221119_104612.JPG', photoCredit: 'ภาพจากระบบข้อมูลสุขภาพ กระทรวงสาธารณสุข', photoPage: 'https://gis-health.moph.go.th/healthmap/info.php?maincode=14354',
  },
  {
    id: 'pat-rangsit', name: 'โรงพยาบาลแพทย์รังสิต', kind: 'โรงพยาบาลเอกชน', category: 'general',
    specialty: 'บริการรักษาโรคทั่วไปและศูนย์การแพทย์เฉพาะทาง', phone: '02-998-9999', department: 'อายุรกรรมทั่วไป',
    doctor: 'ทีมแพทย์ตัวอย่าง', cost: 'ประมาณ 700–1,500 บาท', costNote: demoCost,
    latitude: 13.963294, longitude: 100.621383, area: 'ลำลูกกา · ปทุมธานี',
    photoUrl: 'https://cdn-clinics.topclinic.in.th/583ee463-a82a-4715-97ad-72e390453a8a/RAKbrTQOLzy0-w960.webp', photoCredit: 'ภาพโรงพยาบาลแพทย์รังสิต', photoPage: 'https://www.patrangsit.com/',
  },
  {
    id: 'pathum-thani', name: 'โรงพยาบาลปทุมธานี', kind: 'โรงพยาบาลรัฐ', category: 'general',
    specialty: 'โรงพยาบาลทั่วไปของจังหวัด ให้บริการหลายสาขา', phone: '02-598-8888', department: 'อายุรกรรมทั่วไป',
    doctor: 'ทีมแพทย์ตัวอย่าง', cost: 'ประมาณ 100–500 บาท', costNote: demoCost,
    latitude: 14.02096, longitude: 100.52327, area: 'บางปรอก · ปทุมธานี',
    photoUrl: 'https://gis-health.moph.go.th/healthmap/upload/hospital/p_10687_231215_100927.JPG', photoCredit: 'ภาพจากระบบข้อมูลสุขภาพ กระทรวงสาธารณสุข', photoPage: 'https://gis-health.moph.go.th/healthmap/info.php?maincode=10687',
  },
  {
    id: 'st-carlos', name: 'โรงพยาบาลกรุงสยามเซนต์คาร์ลอส', kind: 'โรงพยาบาลเอกชน', category: 'general',
    specialty: 'บริการรักษาโรคทั่วไปและคลินิกเฉพาะทาง', phone: '02-975-6700', department: 'อายุรกรรมทั่วไป',
    doctor: 'ทีมแพทย์ตัวอย่าง', cost: 'ประมาณ 800–1,800 บาท', costNote: demoCost,
    latitude: 14.0049999, longitude: 100.5518156, area: 'เมืองปทุมธานี · ปทุมธานี',
    photoUrl: 'https://static.hdmall.co.th/1146x735/webp/system/brands/general_brand_images/9432/original/krung-siam-st-carlos-hospital-003.jpg', photoCredit: 'ภาพโรงพยาบาลกรุงสยามเซนต์คาร์ลอส', photoPage: 'https://hdmall.co.th/health-checkup/krung-siam-st-carlos-hospital',
  },
];

export type Appointment = {
  patientId?: string;
  patientName?: string;
  caregiverId?: string;
  reference: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctor: string;
  dateISO: string;
  dateLabel: string;
  timeSlot: string;
  kind: 'advance' | 'checkin';
  rating?: number;
};

export function hospitalById(id?: string | null): Hospital {
  return hospitals.find((hospital) => hospital.id === id) ?? hospitals[0];
}

export function distanceInKm(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(destination.latitude - origin.latitude);
  const lonDelta = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lonDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
