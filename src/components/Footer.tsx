import React from 'react';
import { useAppData } from '../AppDataContext';
import { Link } from 'react-router-dom';
import { slugify, normalizeImageUrl } from '../lib/utils';

export default function Footer() {
  const { categories, siteName, logoUrl, footerText } = useAppData();
  
  return (
    <footer className="bg-[#1a1a1a] text-white pt-12 pb-8 mt-12">
      <div className="max-w-[1280px] mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          {/* About Section */}
          <div className="space-y-4">
            <Link to="/" className="block">
              {logoUrl ? (
                <img 
                  src={normalizeImageUrl(logoUrl)} 
                  alt={siteName} 
                  className="h-12 w-auto object-contain" 
                  style={{ filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)' }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-2xl font-bold">
                  <span className="text-gray-400">MEGA</span>
                  <span className="bg-[#e60026] text-white px-2 py-1 ml-1 rounded">HABER</span>
                </div>
              )}
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Türkiye'den ve dünyadan en son haberler, güncel gelişmeler, siyaset, ekonomi, spor ve teknoloji haberleri Mega Haber'de.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-[#e60026] pl-3">Kategoriler</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-400">
              {categories.slice(0, 10).map((cat, i) => (
                <li key={i}>
                  <Link to={`/category/${slugify(cat.name)}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-[#e60026] pl-3">Servisler</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/servis/mac-sonuclari" className="hover:text-white transition-colors">Canlı Maç Sonuçları</Link></li>
              <li><Link to="/servis/hava-durumu" className="hover:text-white transition-colors">Hava Durumu</Link></li>
              <li><Link to="/servis/namaz-vakitleri" className="hover:text-white transition-colors">Namaz Vakitleri</Link></li>
              <li><Link to="/servis/nobetci-ezcaneler" className="hover:text-white transition-colors">Nöbetçi Eczaneler</Link></li>
              <li><Link to="/servis/borsa" className="hover:text-white transition-colors">Borsa / Finans</Link></li>
              <li><Link to="/servis/trafik-durumu" className="hover:text-white transition-colors">Trafik Durumu</Link></li>
            </ul>
          </div>

          {/* Corporate */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-[#e60026] pl-3">Kurumsal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/kunye" className="hover:text-white transition-colors">Künye</Link></li>
              <li><Link to="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              <li><Link to="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link to="/kullanim-sartlari" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
              <li><Link to="/rss" className="hover:text-white transition-colors">RSS</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-[#e60026] pl-3">İletişim</h4>
            <div className="text-sm text-gray-400 space-y-4">
              <p>Adres: Erdemli, Mersin</p>
              <p>E-posta: info@megahaber.com</p>
              <p>Telefon: +90 (324) 000 00 00</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <p>{footerText || `© 2026 ${siteName || 'Mega Haber'}. Tüm hakları saklıdır.`}</p>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Facebook</span>
            <span className="hover:text-white cursor-pointer">Twitter</span>
            <span className="hover:text-white cursor-pointer">Instagram</span>
            <span className="hover:text-white cursor-pointer">YouTube</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
