import React, { useState, useEffect } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import { Clock, Sunrise, Sun, Sunset, Moon, CloudSun, Loader2, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface PrayerTime {
  name: string;
  time: string;
}

interface PrayerData {
  success: boolean;
  city: string;
  district?: string;
  result: PrayerTime[];
}

export default function PrayerTimes() {
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const fetchPrayerTimes = async (district?: string) => {
    try {
      setLoading(true);
      const url = district ? `/api/pray?district=${district}` : '/api/pray';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      
      if (result.success && result.result && result.result.length > 0) {
        setData(result);
        setError(null);
      } else {
        setError('Şu an namaz vakitleri güncelleniyor, lütfen az sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError('Şu an namaz vakitleri güncelleniyor, lütfen az sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    fetchPrayerTimes(district);
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

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'imsak': return <Clock className="text-indigo-500" size={24} />;
      case 'güneş': return <Sunrise className="text-orange-500" size={24} />;
      case 'öğle': return <Sun className="text-yellow-500" size={24} />;
      case 'ikindi': return <CloudSun className="text-amber-500" size={24} />;
      case 'akşam': return <Sunset className="text-red-500" size={24} />;
      case 'yatsı': return <Moon className="text-blue-500" size={24} />;
      default: return <Clock size={24} />;
    }
  };

  return (
    <ServiceLayout title={`${data?.district || data?.city || 'Şehir'} Namaz Vakitleri`} breadcrumb="Namaz Vakitleri">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* District Selector */}
        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-sm flex items-center justify-center text-red-600">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">İlçe Seçimi</h3>
              <p className="text-xs text-gray-500 font-medium">Mersin'in ilçelerine göre namaz vakitleri.</p>
            </div>
          </div>
          <select 
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full sm:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold text-gray-800"
          >
            <option value="">Şehir Geneli</option>
            {mersinDistricts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-gray-100 shadow-sm">
            <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold animate-pulse">Vakitler Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Clock size={32} />
            </div>
            <p className="text-red-800 font-bold text-lg">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <MapPin size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{data.district || data.city}</span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bugünkü Namaz Vakitleri</h2>
                  <p className="text-gray-500 mt-1 font-medium">Diyanet İşleri Başkanlığı verileriyle güncel vakitler.</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 rounded-sm border border-gray-100 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bugün</p>
                  <p className="text-xl font-black text-gray-900">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Vakitler Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.result.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:border-red-100 hover:shadow-md transition-all text-center group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {getIcon(item.name)}
                  </div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.name}</h4>
                  <p className="text-2xl font-black text-gray-900">{item.time}</p>
                </motion.div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4 items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Bilgilendirme</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Namaz vakitleri CollectAPI üzerinden anlık olarak çekilmektedir. Vakitler Diyanet İşleri Başkanlığı ile uyumludur. 
                  Sistemimiz verileri günde bir kez güncelleyerek hızlı erişim sağlamaktadır.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ServiceLayout>
  );
}
