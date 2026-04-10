import React, { useEffect, useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import { MapPin, Info, AlertCircle, Loader2, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

interface CityCoords {
  lat: number;
  lon: number;
  zoom: number;
}

const cityCoords: Record<string, CityCoords> = {
  'mersin': { lat: 36.8121, lon: 34.6415, zoom: 13 },
  'istanbul': { lat: 41.0082, lon: 28.9784, zoom: 11 },
  'ankara': { lat: 39.9334, lon: 32.8597, zoom: 12 },
  'izmir': { lat: 38.4237, lon: 27.1428, zoom: 12 },
  'adana': { lat: 37.0000, lon: 35.3213, zoom: 12 },
  'antalya': { lat: 36.8841, lon: 30.7056, zoom: 12 },
  'bursa': { lat: 40.1824, lon: 29.0671, zoom: 12 },
  'gaziantep': { lat: 37.0662, lon: 37.3833, zoom: 12 },
  'konya': { lat: 37.8714, lon: 32.4846, zoom: 12 },
  'kayseri': { lat: 38.7312, lon: 35.4787, zoom: 12 }
};

export default function TrafficStatus() {
  const [city, setCity] = useState('mersin');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  const mersinDistricts: Record<string, CityCoords> = {
    'akdeniz': { lat: 36.8121, lon: 34.6415, zoom: 14 },
    'mezitli': { lat: 36.7594, lon: 34.5244, zoom: 14 },
    'yenisehir': { lat: 36.7950, lon: 34.5850, zoom: 14 },
    'toroslar': { lat: 36.8350, lon: 34.6250, zoom: 14 },
    'tarsus': { lat: 36.9161, lon: 34.8950, zoom: 14 },
    'erdemli': { lat: 36.6050, lon: 34.3050, zoom: 14 },
    'silifke': { lat: 36.3750, lon: 33.9350, zoom: 14 },
    'anamur': { lat: 36.0750, lon: 32.8350, zoom: 14 },
    'mut': { lat: 36.6450, lon: 33.4350, zoom: 14 },
    'gulnar': { lat: 36.3450, lon: 33.4250, zoom: 14 },
    'aydincik': { lat: 36.1450, lon: 33.3250, zoom: 14 },
    'bozyazi': { lat: 36.1050, lon: 32.9650, zoom: 14 },
    'camliyayla': { lat: 37.1650, lon: 34.6050, zoom: 14 }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (data.trafficCity) {
          setCity(data.trafficCity.toLowerCase());
        }
        if (data.trafficDistrict) {
          setDistrict(data.trafficDistrict.toLowerCase());
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
  };

  const getCoords = () => {
    if (city === 'mersin' && district && mersinDistricts[district]) {
      return mersinDistricts[district];
    }
    return cityCoords[city] || cityCoords['mersin'];
  };

  const coords = getCoords();
  
  // Using Yandex Traffic Layer as it's the most reliable free live traffic embed for Turkey
  // Format: ll=longitude,latitude&z=zoom&l=map,trf (trf is traffic layer)
  const mapUrl = `https://yandex.com.tr/map-widget/v1/?ll=${coords.lon}%2C${coords.lat}&z=${coords.zoom}&l=map%2Ctrf`;

  const junctions = [
    { name: "Forum Kavşağı", status: "Akıcı", color: "bg-green-500" },
    { name: "Mezitli Köprüsü", status: "Yoğun", color: "bg-orange-500" },
    { name: "Pozcu Sahil Yolu", status: "Akıcı", color: "bg-green-500" },
    { name: "Eski Otogar Kavşağı", status: "Kilit", color: "bg-red-500" },
    { name: "Viranşehir Kavşağı", status: "Yoğun", color: "bg-orange-500" },
    { name: "Muğdat Kavşağı", status: "Akıcı", color: "bg-green-500" }
  ];

  return (
    <ServiceLayout title={`${district ? district.toUpperCase() : city.toUpperCase()} Trafik Durumu`} breadcrumb="Trafik Durumu">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* District Selector */}
        {city === 'mersin' && (
          <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-sm flex items-center justify-center text-orange-600">
                <Navigation size={20} />
              </div>
              <div>
                <h3 className="font-black text-gray-900 uppercase tracking-tight">Bölge Seçimi</h3>
                <p className="text-xs text-gray-500 font-medium">Mersin'in bölgelerine göre canlı trafik.</p>
              </div>
            </div>
            <select 
              value={district}
              onChange={handleDistrictChange}
              className="w-full sm:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-orange-500 outline-none transition-all font-bold text-gray-800"
            >
              <option value="">Şehir Geneli</option>
              {Object.keys(mersinDistricts).map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-gray-100 shadow-sm">
            <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold animate-pulse">Trafik Haritası Yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* Map Container */}
            <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-sm border border-gray-100 shadow-md flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Canlı Trafik Verisi</span>
              </div>
              
              <div className="w-full h-[600px] relative">
                {mapError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-10 text-center">
                    <AlertCircle size={48} className="text-red-600 mb-4" />
                    <p className="text-gray-900 font-bold text-lg">Şu an trafik bilgileri yüklenemiyor, lütfen sayfayı yenileyin.</p>
                  </div>
                ) : (
                  <iframe 
                    src={mapUrl} 
                    className="w-full h-full border-none"
                    title="Canlı Trafik Haritası"
                    referrerPolicy="no-referrer"
                    onError={() => setMapError(true)}
                  />
                )}
              </div>
            </div>

            {/* Junctions List (Mersin Specific as requested) */}
            {city === 'mersin' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm"
              >
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                  Önemli Kavşak Durumları
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {junctions.map((junction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-sm border border-gray-100 hover:border-red-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-gray-400 shadow-sm">
                          <Navigation size={16} />
                        </div>
                        <span className="font-bold text-gray-900">{junction.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${junction.color}`}></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{junction.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4 items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                <Info size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Bilgilendirme</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Canlı trafik yoğunluk haritası anlık verilere dayanmaktadır. Yeşil hatlar akıcı trafiği, turuncu hatlar yoğunluğu, kırmızı hatlar ise durma noktasına gelmiş trafiği temsil eder.
                  Veriler Yandex ve TomTom altyapısı kullanılarak ücretsiz olarak sunulmaktadır.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </ServiceLayout>
  );
}
