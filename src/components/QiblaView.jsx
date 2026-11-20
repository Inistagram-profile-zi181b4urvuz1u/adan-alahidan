import React, { useState, useEffect } from 'react';
import { Compass, Navigation } from 'lucide-react';
import { calculateQibla } from '../utils/prayerUtils';

export default function QiblaView({ locationInfo }) {
  const { bearing, distanceKm } = calculateQibla(locationInfo.lat, locationInfo.lng);
  const [heading, setHeading] = useState(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);

  useEffect(() => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      setPermissionNeeded(true);
    }

    const handleOrientation = (e) => {
      let compassHeading = null;
      if (e.webkitCompassHeading !== undefined) {
        compassHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        compassHeading = 360 - e.alpha;
      }
      if (compassHeading !== null) {
        setHeading(Math.round(compassHeading));
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const requestCompassPermission = async () => {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted') {
        setPermissionNeeded(false);
      }
    } catch {
      // Ignore
    }
  };

  const needleRotation = heading !== null ? bearing - heading : bearing;
  const normalizedDiff = Math.abs(((needleRotation + 540) % 360) - 180);
  const isAligned = heading !== null && normalizedDiff <= 5;

  return (
    <div className="space-y-5 pb-6 text-center">
      <div className="bg-emerald-900/40 border border-emerald-800/70 rounded-3xl p-6">
        <div className="flex items-center justify-center gap-2 text-amber-300 mb-1">
          <Compass className="w-5 h-5" />
          <h2 className="text-xl font-extrabold">اتجاه القبلة</h2>
        </div>
        <p className="text-xs text-emerald-300/80 mb-6">
          من {locationInfo.cityAr} إلى الكعبة المشرفة
        </p>

        {permissionNeeded && (
          <button
            onClick={requestCompassPermission}
            className="mb-6 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl transition"
          >
            تفعيل مستشعر البوصلة (iOS)
          </button>
        )}

        {/* Compass Dial */}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full border-4 transition-colors duration-300 ${
              isAligned
                ? 'border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.35)]'
                : 'border-emerald-700/70'
            } bg-emerald-950/80`}
          />

          {/* Cardinal Points */}
          <span className="absolute top-3 text-xs font-bold text-amber-300">ش</span>
          <span className="absolute bottom-3 text-xs font-bold text-emerald-400">ج</span>
          <span className="absolute right-3 text-xs font-bold text-emerald-400">شر</span>
          <span className="absolute left-3 text-xs font-bold text-emerald-400">غ</span>

          {/* Rotating Needle */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            <div className="relative flex flex-col items-center">
              <Navigation
                className={`w-12 h-12 transition-colors ${
                  isAligned ? 'text-amber-400 fill-amber-400' : 'text-emerald-300 fill-emerald-300/30'
                }`}
              />
              <span className="mt-1 text-[10px] font-bold bg-emerald-900/90 text-amber-200 px-2 py-0.5 rounded-full border border-emerald-700">
                الكعبة
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3">
            <div className="text-[11px] text-emerald-300/80">زاوية القبلة</div>
            <div dir="ltr" className="text-xl font-extrabold text-amber-300 font-mono">
              {bearing}°
            </div>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3">
            <div className="text-[11px] text-emerald-300/80">المسافة إلى مكة</div>
            <div className="text-xl font-extrabold text-white font-mono">
              {distanceKm.toLocaleString('ar-MA')} كم
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-emerald-300/80">
          {heading !== null
            ? isAligned
              ? 'أنت الآن متجه نحو القبلة بدقة ✓'
              : 'أدر هاتفك حتى يتطابق السهم مع اتجاه الشمال'
            : 'على الحاسوب: اتجاه القبلة هو شرقاً مائلاً قليلاً نحو الشمال حسب الزاوية أعلاه.'}
        </p>
      </div>
    </div>
  );
}
