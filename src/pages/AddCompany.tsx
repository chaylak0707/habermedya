import React, { useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import { Building2, User, Phone, MessageCircle, MapPin, Globe, FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const MERSIN_DISTRICTS = [
  "Akdeniz", "Mezitli", "Yenişehir", "Toroslar", "Tarsus", 
  "Erdemli", "Silifke", "Anamur", "Mut", "Gülnar", "Bozyazı", "Aydıncık", "Çamlıyayla"
];

const CATEGORIES = [
  "İnşaat & Yapı", "Sağlık", "Eğitim", "Gıda & Restoran", 
  "Otomotiv", "Teknoloji", "Hizmet", "Turizm", "Diğer"
];

export default function AddCompany() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    authorizedPerson: '',
    phone: '',
    whatsapp: '',
    address: '',
    district: '',
    website: '',
    description: ''
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value as string);
      });
      if (logo) {
        data.append('logo', logo);
      }

      const response = await fetch('/api/companies', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setFormData({
          name: '',
          category: '',
          authorizedPerson: '',
          phone: '',
          whatsapp: '',
          address: '',
          district: '',
          website: '',
          description: ''
        });
        setLogo(null);
        setLogoPreview(null);
      } else {
        setStatus({ type: 'error', message: result.error || 'Bir hata oluştu.' });
      }
    } catch (error) {
      console.error("Error submitting company:", error);
      setStatus({ type: 'error', message: 'Sunucuya bağlanırken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceLayout title="Firma Ekle" breadcrumb="Rehber / Firma Ekle">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-900 p-8 text-white">
            <h2 className="text-3xl font-black tracking-tight mb-2">Firmanızı Kaydedin</h2>
            <p className="text-gray-400 font-medium">Bilgilerinizi doldurun, onaylandıktan sonra rehberde yerinizi alın.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-sm flex items-center gap-3 ${
                  status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="font-bold">{status.message}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Firma Adı */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Building2 size={14} className="text-[#e60026]" /> Firma Adı *
                </label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Örn: Dinç Sıhhi Tesisat"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <FileText size={14} className="text-[#e60026]" /> Kategori *
                </label>
                <select 
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium appearance-none"
                >
                  <option value="">Seçiniz</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Yetkili Kişi */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <User size={14} className="text-[#e60026]" /> Yetkili Kişi *
                </label>
                <input 
                  type="text" 
                  name="authorizedPerson"
                  required
                  value={formData.authorizedPerson}
                  onChange={handleChange}
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Phone size={14} className="text-[#e60026]" /> Telefon *
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05xx xxx xx xx"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp Numarası *
                </label>
                <input 
                  type="tel" 
                  name="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="905xx xxx xx xx"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium"
                />
              </div>

              {/* İlçe */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <MapPin size={14} className="text-[#e60026]" /> İlçe *
                </label>
                <select 
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium appearance-none"
                >
                  <option value="">Seçiniz</option>
                  {MERSIN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Web Sitesi */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Globe size={14} className="text-[#e60026]" /> Web Sitesi (Opsiyonel)
              </label>
              <input 
                type="text" 
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="www.firmaniz.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium"
              />
            </div>

            {/* Adres */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <MapPin size={14} className="text-[#e60026]" /> Açık Adres *
              </label>
              <textarea 
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="Mahalle, Sokak, No..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium resize-none"
              ></textarea>
            </div>

            {/* Açıklama */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <FileText size={14} className="text-[#e60026]" /> Firma Açıklaması *
              </label>
              <textarea 
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Firmanızın faaliyet alanları, hizmetleri vb."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#e60026] font-medium resize-none"
              ></textarea>
            </div>

            {/* Logo Yükleme */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Upload size={14} className="text-[#e60026]" /> Firma Logosu
              </label>
              <div className="flex items-center gap-6 p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-sm">
                <div className="w-24 h-24 bg-white border border-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Building2 size={32} className="text-gray-200" />
                  )}
                </div>
                <div className="flex-1">
                  <input 
                    type="file" 
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="inline-block px-6 py-2 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-sm cursor-pointer hover:bg-black transition-all"
                  >
                    Dosya Seç
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">PNG, JPG veya JPEG (Max 5MB)</p>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#e60026] text-white py-4 rounded-sm font-black text-lg tracking-tight hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
            >
              {loading ? 'GÖNDERİLİYOR...' : 'FİRMAYI KAYDET'}
            </button>
          </form>
        </div>
      </div>
    </ServiceLayout>
  );
}
