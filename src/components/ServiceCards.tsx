import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, PlusSquare, CloudSun, Moon, TrafficCone, Timer } from 'lucide-react';
import { useAppData } from '../AppDataContext';
import { normalizeImageUrl } from '../lib/utils';

export default function ServiceCards() {
  const appData = useAppData();
  const serviceBgs = appData?.serviceBgs;

  const services = [
    {
      id: 'stock',
      title: 'Canlı',
      subtitle: 'Borsa',
      icon: TrendingUp,
      image: serviceBgs?.stock ? normalizeImageUrl(serviceBgs.stock) : 'https://images.unsplash.com/photo-1611974717484-7da00ff12990?q=80&w=800&auto=format&fit=crop',
      link: '/servis/borsa',
      color: 'from-blue-900/80 to-blue-900/40'
    },
    {
      id: 'pharmacy',
      title: 'Nöbetçi',
      subtitle: 'Eczaneler',
      icon: PlusSquare,
      image: serviceBgs?.pharmacy ? normalizeImageUrl(serviceBgs.pharmacy) : 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=800&auto=format&fit=crop',
      link: '/servis/nobetci-ezcaneler',
      color: 'from-gray-900/80 to-gray-900/40'
    },
    {
      id: 'weather',
      title: 'Hava',
      subtitle: 'Durumu',
      icon: CloudSun,
      image: serviceBgs?.weather ? normalizeImageUrl(serviceBgs.weather) : 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=800&auto=format&fit=crop',
      link: '/servis/hava-durumu',
      color: 'from-orange-900/80 to-orange-900/40'
    },
    {
      id: 'prayer',
      title: 'Namaz',
      subtitle: 'Vakitleri',
      icon: Moon,
      image: serviceBgs?.prayer ? normalizeImageUrl(serviceBgs.prayer) : 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop',
      link: '/servis/namaz-vakitleri',
      color: 'from-emerald-900/80 to-emerald-900/40'
    },
    {
      id: 'traffic',
      title: 'Trafik',
      subtitle: 'Durumu',
      icon: TrafficCone,
      image: serviceBgs?.traffic ? normalizeImageUrl(serviceBgs.traffic) : 'https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=800&auto=format&fit=crop',
      link: '/servis/trafik-durumu',
      color: 'from-indigo-900/80 to-indigo-900/40'
    },
    {
      id: 'results',
      title: 'Canlı',
      subtitle: 'Sonuçlar',
      icon: Timer,
      image: serviceBgs?.results ? normalizeImageUrl(serviceBgs.results) : 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
      link: '/servis/mac-sonuclari',
      color: 'from-green-900/80 to-green-900/40'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
      {services.map((service) => (
        <Link 
          key={service.id} 
          to={service.link}
          className="relative aspect-[10/13] group overflow-hidden rounded-sm shadow-md"
        >
          <img 
            src={service.image} 
            alt={service.subtitle}
            className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${service.color} flex flex-col justify-end p-4 text-white`}>
            <div className="flex flex-col items-end text-right transform transition-transform duration-300 group-hover:-translate-y-1">
              <div className="mb-3 p-2 bg-white/10 rounded-sm backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <service.icon size={20} className="opacity-100" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-0.5">{service.title}</span>
              <span className="text-base font-black uppercase tracking-wider leading-tight">{service.subtitle}</span>
            </div>
          </div>
          <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 transition-colors pointer-events-none"></div>
        </Link>
      ))}
    </div>
  );
}
