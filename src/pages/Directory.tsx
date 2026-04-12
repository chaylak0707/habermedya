import React, { useEffect, useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import { Search, MapPin, Phone, Globe, MessageCircle, Filter, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Company } from '../types';
import { motion } from 'motion/react';

const MERSIN_DISTRICTS = [
  "Akdeniz", "Mezitli", "Yenişehir", "Toroslar", "Tarsus", 
  "Erdemli", "Silifke", "Anamur", "Mut", "Gülnar", "Bozyazı", "Aydıncık", "Çamlıyayla"
];

const CATEGORIES = [
  "İnşaat & Yapı", "Sağlık", "Eğitim", "Gıda & Restoran", 
  "Otomotiv", "Teknoloji", "Hizmet", "Turizm", "Diğer"
];

export default function Directory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [filterDistrict, filterCategory]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      let url = '/api/companies';
      const params = new URLSearchParams();
      if (filterDistrict) params.append('district', filterDistrict);
      if (filterCategory) params.append('category', filterCategory);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ServiceLayout title="Firma Rehberi" breadcrumb="Rehber">
      <div className="space-y-6">
        {/* Header & Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-sm border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Şehir Rehberi</h2>
            <p className="text-gray-500 font-medium">Mersin'deki işletmeleri keşfedin veya kendi firmanızı ekleyin.</p>
          </div>
          <Link 
            to="/rehber/firma-ekle"
            className="flex items-center gap-2 bg-[#e60026] text-white px-6 py-3 rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
          >
            <PlusCircle size={20} />
            FİRMANI EKLE
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-sm border border-gray-100 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Firma adı veya açıklama..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium appearance-none"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="">Tüm İlçeler</option>
              {MERSIN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium appearance-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button 
            onClick={() => { setFilterDistrict(''); setFilterCategory(''); setSearchTerm(''); }}
            className="py-2 bg-gray-100 text-gray-600 rounded-sm font-bold hover:bg-gray-200 transition-all"
          >
            Filtreleri Temizle
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60026]"></div>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <motion.div 
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col"
              >
                <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center p-4">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-2">
                      <PlusCircle size={48} strokeWidth={1} />
                      <span className="text-xs font-bold uppercase tracking-widest">Logo Yok</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-[#e60026] border border-red-100 uppercase tracking-widest">
                    {company.category}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                    <MapPin size={12} className="text-[#e60026]" />
                    {company.district}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#e60026] transition-colors leading-tight">
                    {company.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                    {company.description}
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                      <Phone size={16} className="text-gray-400" />
                      {company.phone}
                    </div>
                    {company.website && (
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-blue-600 font-bold hover:underline"
                      >
                        <Globe size={16} className="text-blue-400" />
                        Web Sitesi
                      </a>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <a 
                        href={`tel:${company.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-sm font-bold text-xs hover:bg-black transition-all whitespace-nowrap"
                      >
                        <Phone size={14} />
                        ARA
                      </a>
                      <a 
                        href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-sm font-bold text-xs hover:bg-[#128C7E] transition-all whitespace-nowrap"
                      >
                        <MessageCircle size={14} />
                        WHATSAPP
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-sm py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Firma Bulunamadı</h3>
            <p className="text-gray-500 font-medium">Arama kriterlerinize uygun firma bulunamadı.</p>
            <button 
              onClick={() => { setFilterDistrict(''); setFilterCategory(''); setSearchTerm(''); }}
              className="mt-6 text-[#e60026] font-black uppercase tracking-widest text-sm hover:underline"
            >
              Tüm Filtreleri Sıfırla
            </button>
          </div>
        )}
      </div>
    </ServiceLayout>
  );
}
