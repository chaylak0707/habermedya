import React, { useEffect, useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import { Loader2, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudSun, Wind, Thermometer, Droplets, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

interface DailyWeather {
  date: string;
  day: string;
  max: number;
  min: number;
  status: string;
  emoji: string;
}

interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  status: string;
  emoji: string;
  code: number;
}

interface WeatherData {
  success: boolean;
  city: string;
  current: CurrentWeather;
  daily: DailyWeather[];
  message?: string;
}

const getWeatherIcon = (status: string, size: number = 24) => {
  const s = status.toLowerCase();
  if (s.includes('güneş') || s.includes('açık')) return <Sun size={size} className="text-yellow-500" />;
  if (s.includes('parçalı bulutlu')) return <CloudSun size={size} className="text-gray-400" />;
  if (s.includes('bulut')) return <Cloud size={size} className="text-gray-400" />;
  if (s.includes('yağmur')) return <CloudRain size={size} className="text-blue-500" />;
  if (s.includes('fırtına') || s.includes('şimşek')) return <CloudLightning size={size} className="text-indigo-500" />;
  if (s.includes('kar')) return <CloudSnow size={size} className="text-blue-200" />;
  if (s.includes('sis')) return <Wind size={size} className="text-gray-300" />;
  return <Wind size={size} className="text-gray-300" />;
};

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const fetchWeather = async (district?: string) => {
    try {
      setLoading(true);
      const url = district ? `/api/weather?district=${district}` : '/api/weather';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setWeather(data);
        setError(null);
      } else {
        setError(data.message || 'Şu an hava durumu bilgileri güncelleniyor, lütfen az sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError('Şu an hava durumu bilgileri güncelleniyor, lütfen az sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    fetchWeather(district);
  };

  const mersinDistricts = [
    { id: 'akdeniz', name: 'Akdeniz' },
    { id: 'yenisehir', name: 'Yenişehir' },
    { id: 'mezitli', name: 'Mezitli' },
    { id: 'toroslar', name: 'Toroslar' },
    { id: 'tarsus', name: 'Tarsus' },
    { id: 'erdemli', name: 'Erdemli' },
    { id: 'silifke', name: 'Silifke' },
    { id: 'anamur', name: 'Anamur' },
    { id: 'aydincik', name: 'Aydıncık' },
    { id: 'bozyazi', name: 'Bozyazı' },
    { id: 'camliyayla', name: 'Çamlıyayla' },
    { id: 'gulnar', name: 'Gülnar' },
    { id: 'mut', name: 'Mut' }
  ];

  return (
    <ServiceLayout title={`${weather?.district || weather?.city || 'Şehir'} Hava Durumu`} breadcrumb="Hava Durumu">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* District Selector */}
        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-sm flex items-center justify-center text-blue-600">
              <Navigation size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">İlçe Seçimi</h3>
              <p className="text-xs text-gray-500 font-medium">Mersin'in ilçelerine göre hava durumu.</p>
            </div>
          </div>
          <select 
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full sm:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
          >
            <option value="">Şehir Geneli</option>
            {mersinDistricts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold animate-pulse">Hava Durumu Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-10 rounded-sm text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <Cloud size={32} />
          </div>
          <p className="text-red-800 font-bold text-lg">{error}</p>
        </div>
      ) : weather ? (
        <div className="space-y-8">
          {/* Today's Detailed Weather Card */}
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-2 opacity-90 mb-2">
                    <span className="text-xs font-black uppercase tracking-widest">{weather.city}</span>
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                    <span className="text-xs font-medium">Bugün</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-7xl font-black tracking-tighter">{weather.current.temp}°</span>
                    <div>
                      <h2 className="text-3xl font-bold">{weather.current.status} {weather.current.emoji}</h2>
                      <p className="text-blue-100 font-medium">Hissedilen: {weather.current.feels_like}°</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-6 rounded-full backdrop-blur-md border border-white/20">
                  {getWeatherIcon(weather.current.status, 80)}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                  <Thermometer size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sıcaklık</p>
                <p className="text-xl font-black text-gray-900">{weather.current.temp}°C</p>
              </div>
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600">
                  <Thermometer size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hissedilen</p>
                <p className="text-xl font-black text-gray-900">{weather.current.feels_like}°C</p>
              </div>
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-3 text-cyan-600">
                  <Droplets size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nem Oranı</p>
                <p className="text-xl font-black text-gray-900">%{weather.current.humidity}</p>
              </div>
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3 text-teal-600">
                  <Navigation size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rüzgar Hızı</p>
                <p className="text-xl font-black text-gray-900">{weather.current.wind_speed} km/s</p>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div>
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              7 Günlük Tahmin
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.daily.map((day, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white border ${index === 0 ? 'border-blue-200 ring-1 ring-blue-50' : 'border-gray-100'} rounded-sm p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group`}
                >
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{day.day}</span>
                  <div className="mb-4 group-hover:scale-110 transition-transform">
                    {getWeatherIcon(day.status, 32)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-black text-gray-900">{day.max}°</span>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-blue-500">{day.min}°</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-red-500">{day.max}°</span>
                    </div>
                  </div>
                  <span className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{day.status} {day.emoji}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-sm flex gap-4 items-start">
            <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 flex-shrink-0">
              <Cloud size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Bilgilendirme</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Hava durumu verileri Open-Meteo API üzerinden anlık koordinat verileriyle çekilmektedir. 
                Sistemimiz verileri saatlik olarak güncelleyerek hem güncel kalmasını sağlar hem de performansı optimize eder.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </ServiceLayout>
  );
}
