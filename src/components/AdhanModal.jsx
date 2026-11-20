import React from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { POST_ADHAN_DUA } from '../data/adhkar';

export default function AdhanModal({ activePrayerName, isPlaying, onStop, onClose }) {
  if (!activePrayerName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-emerald-900 to-emerald-950 border border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden text-center p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-emerald-300 hover:bg-emerald-800/60 transition"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg shadow-amber-500/20">
          <img
            src="/sheikh-luhaidan.jpg"
            alt="الشيخ محمد اللحيدان"
            className={`w-full h-full object-cover grayscale contrast-125 ${isPlaying ? 'scale-105 transition-transform duration-700' : ''}`}
          />
        </div>

        <p className="text-amber-300 text-sm font-semibold mb-1">حان الآن موعد أذان</p>
        <h2 className="text-3xl font-extrabold text-white mb-1">{activePrayerName}</h2>
        <p className="text-xs text-emerald-300 mb-5">بصوت الشيخ محمد اللحيدان</p>

        <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-2xl p-4 mb-6 text-right">
          <h3 className="text-amber-300 text-xs font-bold mb-2">{POST_ADHAN_DUA.title}</h3>
          <p className="font-amiri text-lg leading-loose text-slate-100">
            {POST_ADHAN_DUA.text}
          </p>
        </div>

        <div className="flex gap-3">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition"
            >
              <VolumeX className="w-5 h-5" />
              إيقاف الأذان
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold transition"
            >
              تقبل الله صلاتكم
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
