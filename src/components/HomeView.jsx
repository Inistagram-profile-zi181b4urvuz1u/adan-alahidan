import React from 'react';
import {
  MapPin,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  Square,
  Bell,
  BellOff,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { PRAYER_KEYS, formatTimeDisplay } from '../utils/prayerUtils';

export default function HomeView({
  locationInfo,
  prayerData,
  nextInfo,
  loading,
  error,
  use12Hour,
  hijriOffset,
  onChangeHijriOffset,
  enabledPrayers,
  onTogglePrayerSound,
  onOpenCityModal,
  onRefreshGPS,
  audioUnlocked,
  onUnlockAudio,
  isPreviewPlaying,
  onTogglePreview,
}) {
  const timings = prayerData?.timings;
  const hijri = prayerData?.date?.hijri;
  const gregorian = prayerData?.date?.gregorian;

  const hijriText = hijri
    ? `${hijri.day} ${hijri.month?.ar || ''} ${hijri.year} هـ`
    : 'جاري التحميل...';

  const gregorianText = gregorian
    ? `${gregorian.day} / ${gregorian.month?.number} / ${gregorian.year} م`
    : '';

  return (
    <div className="space-y-4 pb-6">
      {/* Location & Date Header */}
      <div className="bg-emerald-900/50 border border-emerald-800/70 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-extrabold text-white">
                  {locationInfo.cityAr}
                </h1>
                {locationInfo.isGPS && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    GPS
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-300/80">{locationInfo.regionAr}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenCityModal}
              className="flex items-center gap-1 text-xs font-semibold bg-emerald-800/70 hover:bg-emerald-700/80 text-amber-200 px-3 py-2 rounded-xl transition"
            >
              تغيير المدينة
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRefreshGPS}
              title="تحديث الموقع"
              className="p-2 rounded-xl bg-emerald-800/70 hover:bg-emerald-700/80 text-emerald-200 transition"
              aria-label="تحديث الموقع"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dates & Hijri Offset */}
        <div className="mt-3 pt-3 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-200 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{hijriText}</span>
            {gregorianText && (
              <span className="text-emerald-300/70 font-normal">• {gregorianText}</span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-emerald-950/60 rounded-lg p-0.5 border border-emerald-800/60">
            <span className="text-[10px] text-emerald-300 px-1.5">تعديل الهجري:</span>
            {[-1, 0, 1].map((val) => (
              <button
                key={val}
                onClick={() => onChangeHijriOffset(val)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                  hijriOffset === val
                    ? 'bg-amber-500 text-emerald-950'
                    : 'text-emerald-300 hover:bg-emerald-800/60'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-700/60 text-rose-200 text-sm rounded-2xl p-3 text-center">
          {error}
        </div>
      )}

      {/* Next Prayer Countdown Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800/90 via-emerald-900 to-emerald-950 border border-amber-400/30 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-300/90 uppercase tracking-wider">
              الصلاة القادمة
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-0.5">
              {nextInfo?.next?.nameAr || '...'}
            </h2>
            {nextInfo?.next?.timeStr && (
              <p className="text-sm text-emerald-200 mt-0.5">
                الأذان: {formatTimeDisplay(nextInfo.next.timeStr, use12Hour)}
              </p>
            )}
          </div>

          <div className="text-left">
            <div className="text-[11px] text-emerald-300 mb-1">الوقت المتبقي</div>
            <div
              dir="ltr"
              className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-wider font-mono"
            >
              {nextInfo?.countdown || '00:00:00'}
            </div>
          </div>
        </div>

        {/* Subtle Day Progress Timeline */}
        <div className="mt-5">
          <div className="flex justify-between text-[10px] text-emerald-300/80 mb-1.5">
            <span>الفجر</span>
            <span>مسار اليوم</span>
            <span>العشاء</span>
          </div>
          <div className="h-2 w-full bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-800/60">
            <div
              className="h-full bg-gradient-to-l from-amber-400 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${nextInfo?.dayProgress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Adhan Bar (Muhammad Al-Luhaidan) */}
      <div className="bg-emerald-900/40 border border-emerald-800/70 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-amber-400/40 shrink-0 bg-black">
            <img
              src="/sheikh-luhaidan.jpg"
              alt="الشيخ محمد اللحيدان"
              className="w-full h-full object-cover grayscale contrast-125"
            />
            {isPreviewPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-1 h-full origin-bottom" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-2 h-full origin-bottom" />
                  <span className="w-1 bg-amber-400 rounded-full animate-eq-3 h-full origin-bottom" />
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-white">أذان الشيخ محمد اللحيدان</div>
            <div className="text-[11px] text-emerald-300/80">
              {audioUnlocked ? 'الأذان التلقائي مفعّل ✓' : 'اضغط لتفعيل التشغيل التلقائي'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!audioUnlocked && (
            <button
              onClick={onUnlockAudio}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 px-3 py-2 rounded-xl transition shadow-md shadow-amber-500/20"
            >
              تفعيل الأذان التلقائي
            </button>
          )}
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
              isPreviewPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 border border-emerald-700/60'
            }`}
          >
            {isPreviewPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                إيقاف
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                تجربة صوت الأذان
              </>
            )}
          </button>
        </div>
      </div>

      {/* Daily Prayer Times Schedule */}
      <div className="bg-emerald-900/40 border border-emerald-800/70 rounded-3xl overflow-hidden">
        <div className="px-4 py-3 border-b border-emerald-800/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-amber-300">مواقيت الصلاة اليوم</h3>
          <span className="text-[11px] text-emerald-300/80">توقيت وزارة الأوقاف المغربية</span>
        </div>

        <div className="divide-y divide-emerald-800/40">
          {PRAYER_KEYS.map((prayer) => {
            const rawTime = timings?.[prayer.key];
            const isNext = nextInfo?.next?.key === prayer.key;
            const isSoundOn = enabledPrayers[prayer.key] ?? true;

            return (
              <div
                key={prayer.key}
                className={`flex items-center justify-between px-4 py-3.5 transition ${
                  isNext ? 'bg-amber-500/15' : 'hover:bg-emerald-900/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isNext ? 'bg-amber-400 animate-pulse' : 'bg-emerald-700'
                    }`}
                  />
                  <span
                    className={`font-bold text-base ${
                      isNext ? 'text-amber-300' : 'text-slate-100'
                    }`}
                  >
                    {prayer.nameAr}
                  </span>
                  {isNext && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                      القادمة
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    dir="ltr"
                    className={`font-mono font-bold text-base ${
                      isNext ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {rawTime ? formatTimeDisplay(rawTime, use12Hour) : '--:--'}
                  </span>

                  {prayer.hasAdhan ? (
                    <button
                      onClick={() => onTogglePrayerSound(prayer.key)}
                      className={`p-2 rounded-xl transition ${
                        isSoundOn
                          ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
                          : 'text-emerald-500 bg-emerald-950/50 hover:bg-emerald-900'
                      }`}
                      title={isSoundOn ? 'كتم الأذان' : 'تفعيل الأذان'}
                      aria-label={isSoundOn ? 'كتم الأذان' : 'تفعيل الأذان'}
                    >
                      {isSoundOn ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
