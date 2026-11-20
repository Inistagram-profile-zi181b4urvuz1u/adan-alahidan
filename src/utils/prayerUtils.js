export const PRAYER_KEYS = [
  { key: 'Fajr', nameAr: 'الفجر', hasAdhan: true },
  { key: 'Sunrise', nameAr: 'الشروق', hasAdhan: false },
  { key: 'Dhuhr', nameAr: 'الظهر', hasAdhan: true },
  { key: 'Asr', nameAr: 'العصر', hasAdhan: true },
  { key: 'Maghrib', nameAr: 'المغرب', hasAdhan: true },
  { key: 'Isha', nameAr: 'العشاء', hasAdhan: true },
];

export const DEFAULT_ADHAN_URL = '/adhan-luhaidan.m4a';

export const MUEZZINS = [
  {
    id: 'luhaidan',
    nameAr: 'الشيخ محمد اللحيدان',
    descAr: 'الافتراضي • صوت خاشع ومؤثر',
    url: '/adhan-luhaidan.m4a',
  },
  {
    id: 'makkah',
    nameAr: 'أذان المسجد الحرام (مكة)',
    descAr: 'الأذان المكي التقليدي',
    url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
  },
  {
    id: 'madinah',
    nameAr: 'أذان المسجد النبوي (المدينة)',
    descAr: 'أذان الحرم المدني',
    url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
  },
  {
    id: 'alafasy',
    nameAr: 'الشيخ مشاري راشد العفاسي',
    descAr: 'صوت عذب وجميل',
    url: 'https://www.islamcan.com/audio/adhan/azan14.mp3',
  },
  {
    id: 'abdulbasit',
    nameAr: 'الشيخ عبد الباسط عبد الصمد',
    descAr: 'أذان مصري كلاسيكي',
    url: 'https://www.islamcan.com/audio/adhan/azan11.mp3',
  },
];

export async function fetchPrayerTimesByCoords(lat, lng, hijriOffset = 0) {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=21&school=0&adjustment=${hijriOffset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('تعذر جلب مواقيت الصلاة');
  const json = await res.json();
  if (json.code !== 200) throw new Error('بيانات غير صالحة');
  return json.data;
}

export async function fetchPrayerTimesByCity(cityEn, hijriOffset = 0) {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityEn)}&country=Morocco&method=21&school=0&adjustment=${hijriOffset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('تعذر جلب مواقيت الصلاة');
  const json = await res.json();
  if (json.code !== 200) throw new Error('بيانات غير صالحة');
  return json.data;
}

export function cleanTimeStr(timeStr) {
  if (!timeStr) return '00:00';
  return timeStr.split(' ')[0];
}

export function formatTimeDisplay(timeStr, use12Hour) {
  const clean = cleanTimeStr(timeStr);
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return clean;
  if (!use12Hour) {
    return `${String(h).padStart(2, '0')}:${mStr}`;
  }
  const period = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
}

export function getNextPrayerInfo(timings, now = new Date()) {
  if (!timings) return null;

  const todayPrayers = PRAYER_KEYS.map((p) => {
    const clean = cleanTimeStr(timings[p.key]);
    const [h, m] = clean.split(':').map(Number);
    const date = new Date(now);
    date.setHours(h, m, 0, 0);
    return { ...p, timeStr: clean, date };
  });

  let next = todayPrayers.find((p) => p.date > now);
  let prev = null;

  if (next) {
    const idx = todayPrayers.indexOf(next);
    prev = idx > 0 ? todayPrayers[idx - 1] : null;
  } else {
    // Next prayer is tomorrow's Fajr
    const fajr = todayPrayers[0];
    const tomorrowFajr = new Date(fajr.date);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    next = { ...fajr, date: tomorrowFajr };
    prev = todayPrayers[todayPrayers.length - 1];
  }

  const diffMs = Math.max(0, next.date - now);
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const countdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Day progress between Fajr and Isha
  const fajrTime = todayPrayers[0].date.getTime();
  const ishaTime = todayPrayers[todayPrayers.length - 1].date.getTime();
  let dayProgress = 0;
  if (now.getTime() >= ishaTime) {
    dayProgress = 100;
  } else if (now.getTime() > fajrTime) {
    dayProgress = Math.min(100, Math.max(0, ((now.getTime() - fajrTime) / (ishaTime - fajrTime)) * 100));
  }

  return {
    next,
    prev,
    countdown,
    totalSec,
    dayProgress,
  };
}

export function calculateQibla(lat, lng) {
  const kaabaLat = (21.4225 * Math.PI) / 180;
  const kaabaLng = (39.8262 * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const userLng = (lng * Math.PI) / 180;

  const dLng = kaabaLng - userLng;
  const y = Math.sin(dLng) * Math.cos(kaabaLat);
  const x =
    Math.cos(userLat) * Math.sin(kaabaLat) -
    Math.sin(userLat) * Math.cos(kaabaLat) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  // Haversine distance in km
  const R = 6371;
  const dLat = kaabaLat - userLat;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat) * Math.cos(kaabaLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return { bearing: Math.round(bearing * 10) / 10, distanceKm };
}
