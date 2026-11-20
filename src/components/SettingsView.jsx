import React, { useState } from 'react';
import { Volume2, Upload, RotateCcw, Clock, Calendar, MapPin, Bell, BellOff } from 'lucide-react';
import { PRAYER_KEYS, DEFAULT_ADHAN_URL } from '../utils/prayerUtils';

export default function SettingsView({
  use12Hour,
  onToggle12Hour,
  hijriOffset,
  onChangeHijriOffset,
  enabledPrayers,
  onTogglePrayerSound,
  adhanUrl,
  onChangeAdhanUrl,
  isPreviewPlaying,
  onTogglePreview,
  onResetLocation,
}) {
  const [urlInput, setUrlInput] = useState(adhanUrl === DEFAULT_ADHAN_URL ? '' : adhanUrl);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    onChangeAdhanUrl(objectUrl);
  };

  const handleSaveUrl = () => {
    if (urlInput.trim()) {
      onChangeAdhanUrl(urlInput.trim());
    }
  };

  const handleResetAudio = () => {
    setUrlInput('');
    onChangeAdhanUrl(DEFAULT_ADHAN_URL);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Adhan Audio Settings */}
      <div className="bg-emerald-900/40 border border-emerald-800/70 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-amber-300 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            صوت الأذان
          </h3>
          <button
            onClick={onTogglePreview}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
              isPreviewPlaying
                ? 'bg-rose-600 text-white'
                : 'bg-amber-500 text-emerald-950'
            }`}
          >
            {isPreviewPlaying ? 'إيقاف التجربة' : 'تجربة الصوت'}
          </button>
        </div>

        <p className="text-xs text-emerald-200">
          الصوت الافتراضي: <span className="font-bold text-amber-300">أذان الشيخ محمد اللحيدان</span>
        </p>

        <div className="space-y-2 pt-2 border-t border-emerald-800/50">
          <label className="block text-xs text-emerald-300">تغيير الصوت (اختياري): رفع ملف صوتي</label>
          <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-950/60 border border-dashed border-emerald-700 hover:border-amber-400 text-xs text-emerald-200 cursor-pointer transition">
            <Upload className="w-4 h-4 text-amber-300" />
            <span>اختر ملف MP3 / M4A من جهازك</span>
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-emerald-300">أو لصق رابط صوتي مباشر</label>
          <div className="flex gap-2">
            <input
              type="url"
              dir="ltr"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/adhan.mp3"
              className="flex-1 bg-emerald-950/60 border border-emerald-800 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSaveUrl}
              className="bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-xs font-bold px-3 py-2 rounded-xl transition"
            >
              حفظ
            </button>
          </div>
        </div>

        {adhanUrl !== DEFAULT_ADHAN_URL && (
          <button
            onClick={handleResetAudio}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            استعادة أذان الشيخ محمد اللحيدان الافتراضي
          </button>
        )}
      </div>

      {/* Per-Prayer Alerts */}
      <div className="bg-emerald-900/40 border border-emerald-800/70 rounded-3xl p-4 space-y-3">
        <h3 className="font-bold text-amber-300 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          تنبيهات الصلوات
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PRAYER_KEYS.filter((p) => p.hasAdhan).map((p) => {
            const on = enabledPrayers[p.key] ?? true;
            return (
              <button
                key={p.key}
                onClick={() => onTogglePrayerSound(p.key)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-bold transition ${
                  on
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                    : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-500'
                }`}
              >
                <span>{p.nameAr}</span>
                {on ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Format & Hijri Offset */}
      <div className="bg-emerald-900/40 border border-emerald-800/70 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Clock className="w-4 h-4 text-amber-300" />
            نظام الوقت
          </div>
          <div className="flex bg-emerald-950/70 rounded-xl p-1 border border-emerald-800/60">
            <button
              onClick={() => use12Hour && onToggle12Hour()}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                !use12Hour ? 'bg-amber-500 text-emerald-950' : 'text-emerald-300'
              }`}
            >
              24 ساعة
            </button>
            <button
              onClick={() => !use12Hour && onToggle12Hour()}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                use12Hour ? 'bg-amber-500 text-emerald-950' : 'text-emerald-300'
              }`}
            >
              12 ساعة
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-emerald-800/50">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Calendar className="w-4 h-4 text-amber-300" />
            تعديل التاريخ الهجري
          </div>
          <div className="flex bg-emerald-950/70 rounded-xl p-1 border border-emerald-800/60">
            {[-1, 0, 1].map((val) => (
              <button
                key={val}
                onClick={() => onChangeHijriOffset(val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  hijriOffset === val ? 'bg-amber-500 text-emerald-950' : 'text-emerald-300'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-emerald-800/50">
          <button
            onClick={onResetLocation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/70 text-emerald-100 text-xs font-bold transition"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            إعادة ضبط الموقع تلقائياً (GPS)
          </button>
        </div>
      </div>
    </div>
  );
}
