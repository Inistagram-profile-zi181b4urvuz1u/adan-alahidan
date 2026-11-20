import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Compass, BookOpen, Settings } from 'lucide-react';
import { MOROCCAN_CITIES, findNearestMoroccanCity } from './data/moroccanCities';
import {
  DEFAULT_ADHAN_URL,
  fetchPrayerTimesByCoords,
  fetchPrayerTimesByCity,
  getNextPrayerInfo,
} from './utils/prayerUtils';
import HomeView from './components/HomeView';
import QiblaView from './components/QiblaView';
import AdhkarTasbihView from './components/AdhkarTasbihView';
import SettingsView from './components/SettingsView';
import CitySelectorModal from './components/CitySelectorModal';
import AdhanModal from './components/AdhanModal';

const DEFAULT_CITY = MOROCCAN_CITIES[0]; // Casablanca

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const [locationInfo, setLocationInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('salat_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      cityId: DEFAULT_CITY.id,
      cityAr: DEFAULT_CITY.nameAr,
      cityEn: DEFAULT_CITY.nameEn,
      regionAr: DEFAULT_CITY.regionAr,
      lat: DEFAULT_CITY.lat,
      lng: DEFAULT_CITY.lng,
      isGPS: false,
    };
  });

  const [hijriOffset, setHijriOffset] = useState(() => {
    return parseInt(localStorage.getItem('salat_hijri_offset') || '0', 10);
  });

  const [use12Hour, setUse12Hour] = useState(() => {
    return localStorage.getItem('salat_12h') === 'true';
  });

  const [enabledPrayers, setEnabledPrayers] = useState(() => {
    try {
      const saved = localStorage.getItem('salat_enabled_prayers');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
  });

  const [adhanUrl, setAdhanUrl] = useState(() => {
    return localStorage.getItem('salat_adhan_url') || DEFAULT_ADHAN_URL;
  });

  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextInfo, setNextInfo] = useState(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [activeAdhanPrayer, setActiveAdhanPrayer] = useState(null);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);

  const audioRef = useRef(null);
  const lastTriggeredRef = useRef('');

  // Persist settings
  useEffect(() => {
    localStorage.setItem('salat_location', JSON.stringify(locationInfo));
  }, [locationInfo]);

  useEffect(() => {
    localStorage.setItem('salat_hijri_offset', String(hijriOffset));
  }, [hijriOffset]);

  useEffect(() => {
    localStorage.setItem('salat_12h', String(use12Hour));
  }, [use12Hour]);

  useEffect(() => {
    localStorage.setItem('salat_enabled_prayers', JSON.stringify(enabledPrayers));
  }, [enabledPrayers]);

  useEffect(() => {
    if (!adhanUrl.startsWith('blob:')) {
      localStorage.setItem('salat_adhan_url', adhanUrl);
    }
  }, [adhanUrl]);

  // Detect GPS on startup if not manually set, or when requested
  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestMoroccanCity(latitude, longitude);
        setLocationInfo({
          cityId: nearest.id,
          cityAr: nearest.nameAr,
          cityEn: nearest.nameEn,
          regionAr: nearest.regionAr,
          lat: latitude,
          lng: longitude,
          isGPS: true,
        });
      },
      () => {
        // Fallback smoothly to current/default city
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    const hasSaved = localStorage.getItem('salat_location');
    if (!hasSaved) {
      detectGPS();
    }
  }, [detectGPS]);

  // Fetch prayer times whenever location or hijriOffset changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = locationInfo.isGPS
          ? await fetchPrayerTimesByCoords(locationInfo.lat, locationInfo.lng, hijriOffset)
          : await fetchPrayerTimesByCity(locationInfo.cityEn, hijriOffset);
        if (!cancelled) {
          setPrayerData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError('تعذر الاتصال بخادم المواقيت. يرجى التحقق من الإنترنت.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [locationInfo, hijriOffset]);

  // Live countdown & Adhan trigger
  useEffect(() => {
    if (!prayerData?.timings) return;

    const tick = () => {
      const now = new Date();
      const info = getNextPrayerInfo(prayerData.timings, now);
      setNextInfo(info);

      if (info && info.totalSec === 0 && info.next.hasAdhan) {
        const minuteKey = `${info.next.key}-${now.getHours()}:${now.getMinutes()}`;
        if (
          lastTriggeredRef.current !== minuteKey &&
          (enabledPrayers[info.next.key] ?? true)
        ) {
          lastTriggeredRef.current = minuteKey;
          setActiveAdhanPrayer(info.next.nameAr);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .then(() => setIsAdhanPlaying(true))
              .catch(() => setIsAdhanPlaying(false));
          }
        }
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [prayerData, enabledPrayers]);

  const handleUnlockAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = true;
    audioRef.current
      .play()
      .then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.muted = false;
        setAudioUnlocked(true);
      })
      .catch(() => {
        audioRef.current.muted = false;
        setAudioUnlocked(true);
      });
  };

  const handleTogglePreview = () => {
    if (!audioRef.current) return;
    if (isPreviewPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPreviewPlaying(false);
    } else {
      audioRef.current.muted = false;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPreviewPlaying(true);
          setAudioUnlocked(true);
        })
        .catch(() => setIsPreviewPlaying(false));
    }
  };

  const handleStopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAdhanPlaying(false);
    setIsPreviewPlaying(false);
  };

  const handleSelectCity = (city) => {
    setLocationInfo({
      cityId: city.id,
      cityAr: city.nameAr,
      cityEn: city.nameEn,
      regionAr: city.regionAr,
      lat: city.lat,
      lng: city.lng,
      isGPS: false,
    });
  };

  const handleTogglePrayerSound = (key) => {
    setEnabledPrayers((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  };

  return (
    <div className="min-h-screen bg-emerald-950 islamic-pattern text-slate-50 flex flex-col">
      <audio
        ref={audioRef}
        src={adhanUrl}
        preload="auto"
        onEnded={() => {
          setIsPreviewPlaying(false);
          setIsAdhanPlaying(false);
        }}
      />

      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-emerald-950/85 backdrop-blur-md border-b border-emerald-800/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
            <span className="font-extrabold text-base text-white tracking-wide">
              أذان اللحيدان
            </span>
          </div>
          <span className="text-[11px] text-amber-300/90 font-semibold">
            أذان الشيخ محمد اللحيدان
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-4 pb-24">
        {activeTab === 'home' && (
          <HomeView
            locationInfo={locationInfo}
            prayerData={prayerData}
            nextInfo={nextInfo}
            loading={loading}
            error={error}
            use12Hour={use12Hour}
            hijriOffset={hijriOffset}
            onChangeHijriOffset={setHijriOffset}
            enabledPrayers={enabledPrayers}
            onTogglePrayerSound={handleTogglePrayerSound}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            onRefreshGPS={detectGPS}
            audioUnlocked={audioUnlocked}
            onUnlockAudio={handleUnlockAudio}
            isPreviewPlaying={isPreviewPlaying}
            onTogglePreview={handleTogglePreview}
          />
        )}

        {activeTab === 'qibla' && <QiblaView locationInfo={locationInfo} />}

        {activeTab === 'adhkar' && <AdhkarTasbihView />}

        {activeTab === 'settings' && (
          <SettingsView
            use12Hour={use12Hour}
            onToggle12Hour={() => setUse12Hour((v) => !v)}
            hijriOffset={hijriOffset}
            onChangeHijriOffset={setHijriOffset}
            enabledPrayers={enabledPrayers}
            onTogglePrayerSound={handleTogglePrayerSound}
            adhanUrl={adhanUrl}
            onChangeAdhanUrl={setAdhanUrl}
            isPreviewPlaying={isPreviewPlaying}
            onTogglePreview={handleTogglePreview}
            onResetLocation={detectGPS}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-emerald-950/95 backdrop-blur-lg border-t border-emerald-800/70 pb-safe">
        <div className="max-w-lg mx-auto grid grid-cols-4 px-2 pt-2">
          {[
            { id: 'home', label: 'الرئيسية', icon: Home },
            { id: 'qibla', label: 'القبلة', icon: Compass },
            { id: 'adhkar', label: 'الأذكار', icon: BookOpen },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                  active ? 'text-amber-300' : 'text-emerald-400 hover:text-emerald-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[11px] font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelectCity={handleSelectCity}
        onDetectGPS={detectGPS}
        currentCityId={locationInfo.cityId}
      />

      <AdhanModal
        activePrayerName={activeAdhanPrayer}
        isPlaying={isAdhanPlaying}
        onStop={handleStopAdhan}
        onClose={() => {
          handleStopAdhan();
          setActiveAdhanPrayer(null);
        }}
      />
    </div>
  );
}
