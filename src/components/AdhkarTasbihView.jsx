import React, { useState, useEffect } from 'react';
import { RotateCcw, Sun, Moon, Sparkles } from 'lucide-react';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '../data/adhkar';

export default function AdhkarTasbihView() {
  const [subTab, setSubTab] = useState('tasbih'); // 'tasbih' | 'morning' | 'evening'
  const [tasbihCount, setTasbihCount] = useState(() => {
    return parseInt(localStorage.getItem('salat_tasbih_count') || '0', 10);
  });
  const [tasbihTarget, setTasbihTarget] = useState(() => {
    return parseInt(localStorage.getItem('salat_tasbih_target') || '33', 10);
  });
  const [dhikrCounts, setDhikrCounts] = useState({});

  useEffect(() => {
    localStorage.setItem('salat_tasbih_count', String(tasbihCount));
  }, [tasbihCount]);

  useEffect(() => {
    localStorage.setItem('salat_tasbih_target', String(tasbihTarget));
  }, [tasbihTarget]);

  const handleTasbihTap = () => {
    if (navigator.vibrate) navigator.vibrate(25);
    setTasbihCount((c) => c + 1);
  };

  const handleResetTasbih = () => {
    setTasbihCount(0);
  };

  const handleDhikrTap = (id, target) => {
    if (navigator.vibrate) navigator.vibrate(15);
    setDhikrCounts((prev) => {
      const current = prev[id] || 0;
      if (current >= target) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const progress = Math.min(100, ((tasbihCount % tasbihTarget || (tasbihCount > 0 && tasbihCount % tasbihTarget === 0 ? tasbihTarget : 0)) / tasbihTarget) * 100);

  return (
    <div className="space-y-4 pb-6">
      {/* Sub-navigation */}
      <div className="grid grid-cols-3 gap-2 bg-emerald-900/50 p-1.5 rounded-2xl border border-emerald-800/70">
        <button
          onClick={() => setSubTab('tasbih')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
            subTab === 'tasbih'
              ? 'bg-amber-500 text-emerald-950 shadow'
              : 'text-emerald-200 hover:bg-emerald-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          السبحة
        </button>
        <button
          onClick={() => setSubTab('morning')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
            subTab === 'morning'
              ? 'bg-amber-500 text-emerald-950 shadow'
              : 'text-emerald-200 hover:bg-emerald-800/50'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          أذكار الصباح
        </button>
        <button
          onClick={() => setSubTab('evening')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
            subTab === 'evening'
              ? 'bg-amber-500 text-emerald-950 shadow'
              : 'text-emerald-200 hover:bg-emerald-800/50'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          أذكار المساء
        </button>
      </div>

      {subTab === 'tasbih' && (
        <div className="bg-emerald-900/40 border border-emerald-800/70 rounded-3xl p-6 text-center space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[33, 99, 100].map((t) => (
                <button
                  key={t}
                  onClick={() => setTasbihTarget(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    tasbihTarget === t
                      ? 'bg-amber-500 text-emerald-950'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={handleResetTasbih}
              className="flex items-center gap-1 text-xs text-emerald-300 hover:text-amber-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تصفير
            </button>
          </div>

          <button
            onClick={handleTasbihTap}
            className="w-52 h-52 mx-auto rounded-full bg-gradient-to-b from-emerald-800 to-emerald-950 border-4 border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.15)] active:scale-95 transition-transform flex flex-col items-center justify-center select-none"
          >
            <span className="text-5xl font-extrabold text-amber-300 font-mono">
              {tasbihCount}
            </span>
            <span className="text-xs text-emerald-300 mt-2">اضغط للتسبيح</span>
          </button>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-emerald-300">
              <span>الهدف الحالي: {tasbihTarget}</span>
              <span>الدورة: {Math.floor(tasbihCount / tasbihTarget)}</span>
            </div>
            <div className="h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/60">
              <div
                className="h-full bg-amber-400 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {(subTab === 'morning' || subTab === 'evening') && (
        <div className="space-y-3">
          {(subTab === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR).map((item) => {
            const count = dhikrCounts[item.id] || 0;
            const done = count >= item.target;
            return (
              <button
                key={item.id}
                onClick={() => handleDhikrTap(item.id, item.target)}
                className={`w-full text-right p-4 rounded-2xl border transition ${
                  done
                    ? 'bg-emerald-950/50 border-emerald-800/40 opacity-65'
                    : 'bg-emerald-900/40 border-emerald-800/70 hover:border-amber-400/40'
                }`}
              >
                <p className="font-amiri text-lg leading-loose text-slate-100 mb-3">
                  {item.text}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300/80">
                    {done ? 'تمت القراءة ✓' : 'اضغط للعد'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold font-mono ${
                      done
                        ? 'bg-emerald-700/40 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {count} / {item.target}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
