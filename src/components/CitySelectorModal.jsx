import React, { useState } from 'react';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { MOROCCAN_CITIES } from '../data/moroccanCities';

export default function CitySelectorModal({ isOpen, onClose, onSelectCity, onDetectGPS, currentCityId }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = MOROCCAN_CITIES.filter(
    (c) =>
      c.nameAr.includes(query.trim()) ||
      c.nameEn.toLowerCase().includes(query.trim().toLowerCase()) ||
      c.regionAr.includes(query.trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-emerald-950 border border-emerald-800/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-800/60 bg-emerald-900/40">
          <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            اختر المدينة المغربية
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-emerald-300 hover:bg-emerald-800/60 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 border-b border-emerald-800/40">
          <button
            onClick={() => {
              onDetectGPS();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold transition shadow-lg shadow-amber-500/20"
          >
            <Navigation className="w-4 h-4" />
            تحديد موقعي الآن (GPS)
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مدينة أو جهة..."
              className="w-full bg-emerald-900/60 border border-emerald-700/60 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white placeholder-emerald-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {filtered.map((city) => {
            const isSelected = city.id === currentCityId;
            return (
              <button
                key={city.id}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full text-right px-4 py-3 rounded-xl flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200'
                    : 'hover:bg-emerald-900/60 text-slate-100 border border-transparent'
                }`}
              >
                <div>
                  <div className="font-bold text-base">{city.nameAr}</div>
                  <div className="text-xs text-emerald-300/80">{city.regionAr}</div>
                </div>
                {isSelected && (
                  <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full font-semibold">
                    محددة
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-emerald-400 text-sm">
              لم يتم العثور على مدينة مطابقة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
