import React, { useEffect, useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import { Loader2, MapPin, Phone, Clock as ClockIcon, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface Pharmacy {
  name: string;
  dist: string;
  address: string;
  phone: string;
  loc: string;
}

interface PharmacyData {
  success: boolean;
  city: string;
  district?: string;
  result: Pharmacy[];
}

export default function DutyPharmacies() {
  const [data, setData] = useState<PharmacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const fetchPharmacies = async (district?: string) => {
    try {
      setLoading(true);
      const url = district ? `/api/pharmacies?district=${district}` : '/api/pharmacies';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.result) {
        setData(result);
        setError(null);
      } else {
        setError('Şu an eczane bilgileri güncelleniyor, lütfen az sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
      setError('Şu an eczane bilgileri güncelleniyor, lütfen az sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    fetchPharmacies(district);
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
    <ServiceLayout title={`${data?.district || data?.city || 'Şehir'} Nöbetçi Eczaneler`} breadcrumb="Nöbetçi Eczaneler">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* District Selector */}
        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-sm flex items-center justify-center text-red-600">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">İlçe Seçimi</h3>
              <p className="text-xs text-gray-500 font-medium">Mersin'in ilçelerine göre nöbetçi eczaneler.</p>
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
            <p className="text-gray-500 font-bold animate-pulse">Eczaneler Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Phone size={32} />
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
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Nöbetçi Eczaneler</h2>
                  <p className="text-gray-500 mt-1 font-medium">Bugün hizmet veren nöbetçi eczane listesi.</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 rounded-sm border border-gray-100 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tarih</p>
                  <p className="text-xl font-black text-gray-900">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.result.map((pharmacy, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm hover:border-red-200 hover:shadow-md transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight group-hover:text-red-600 transition-colors">
                      {pharmacy.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-red-600 mt-1">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{pharmacy.dist}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                    <ClockIcon size={20} />
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-50 rounded-sm flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-gray-400" />
                    </div>
                    <p className="leading-relaxed font-medium">{pharmacy.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-50 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-gray-400" />
                    </div>
                    <a 
                      href={`tel:${pharmacy.phone.replace(/\s+/g, '')}`} 
                      className="text-lg font-black text-gray-900 hover:text-red-600 transition-colors"
                    >
                      {pharmacy.phone}
                    </a>
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-50">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' ' + data.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-sm font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <ExternalLink size={14} />
                    Haritada Gör
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {data.result.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <MapPin size={32} />
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Şu an listelenecek eczane bulunamadı.</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4 items-start">
            <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center text-blue-600 flex-shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Bilgilendirme</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Nöbetçi eczane listesi CollectAPI üzerinden anlık olarak güncellenmektedir. 
                Sistemimiz verileri günde bir kez güncelleyerek hızlı erişim sağlamaktadır. 
                Eczaneye gitmeden önce telefonla teyit etmeniz önerilir.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </ServiceLayout>
  );
}
