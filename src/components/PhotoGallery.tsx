import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { db } from '../db';
import { fetchWithCache, normalizeImageUrl } from '../lib/utils';

export default function PhotoGallery(props: { onReady?: () => void }) {
  const [images, setImages] = useState<{id: string, url: string, caption?: string}[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const imagesData = (await fetchWithCache('gallery', 'gallery')) as {id: string, url: string, caption?: string, createdAt: string}[];
      setImages(imagesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10));
      setLoaded(true);
      if (props.onReady) props.onReady();
    };
    fetchData();
  }, []);

  if (images.length === 0) {
    // Fallback to mock data if empty
    const mockGallery = [
      { id: '1', url: 'https://picsum.photos/seed/p1/600/600', caption: 'Günlük Hayattan Renkli Kareler' },
      { id: '2', url: 'https://picsum.photos/seed/p2/300/300', caption: 'Ünlülerden En Son Görüntüler' },
      { id: '3', url: 'https://picsum.photos/seed/p3/300/300', caption: 'Yurdum İnsanından Sıcacık Kareler' },
      { id: '4', url: 'https://picsum.photos/seed/p4/300/300', caption: 'Doğanın Büyüleyici Güzellikleri' },
      { id: '5', url: 'https://picsum.photos/seed/p5/300/300', caption: 'Podyumlardan En Güzel Kareler' },
    ];
    
    return (
      <div>
        <div className="relative mb-6">
          <div className="flex items-center border-b-2 border-gray-300">
            <div className="bg-gray-800 text-white px-6 py-2 font-bold relative clip-path-tab">
              Foto Galeri
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 md:row-span-2 relative overflow-hidden h-[250px] sm:h-[350px] md:h-auto group">
            <img 
              src={mockGallery[0].url} 
              alt="" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              onError={(e) => {
                e.currentTarget.src = "https://picsum.photos/seed/plumbing/600/600";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-white font-bold text-lg">{mockGallery[0].caption}</h3>
              <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50" size={48} />
            </div>
          </div>
          {mockGallery.slice(1).map((item) => (
            <div key={item.id} className="relative overflow-hidden h-[180px] sm:h-[200px] group">
              <img 
                src={item.url} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/plumbing/300/300";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                <h3 className="text-white font-bold text-sm">{item.caption}</h3>
                <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50" size={32} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-black text-white px-6 py-3 font-bold text-lg inline-block mb-6 clip-path-category">
        Foto Galeri
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Large item */}
        {images.length > 0 && images[0].url && (
          <div className="md:col-span-1 md:row-span-2 relative overflow-hidden group h-[250px] sm:h-[350px] md:h-auto">
            <img 
              src={normalizeImageUrl(images[0].url)} 
              alt={images[0].caption || "Galeri"} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Only log if it's not a known missing file or if we want to debug
                // console.error(`Image load error for gallery item: ${images[0].id}`);
                e.currentTarget.src = "https://picsum.photos/seed/gallery-fallback/600/600";
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-6">
              <Camera className="text-white/80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={48} />
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 inline-block w-max mb-2">GALERİ</div>
              <h3 className="text-white font-bold text-xl">{images[0].caption}</h3>
            </div>
          </div>
        )}
        
        {/* Small items */}
        {images.slice(1, 5).map((img, index) => img.url && (
          <div key={img.id} className="relative overflow-hidden group h-[180px] sm:h-[200px]">
            <img 
              src={normalizeImageUrl(img.url)} 
              alt={img.caption || "Galeri"} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                // e.currentTarget.src = "https://picsum.photos/seed/gallery-fallback/300/300";
                e.currentTarget.src = `https://picsum.photos/seed/${img.id}/300/300`;
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-4">
              <Camera className="text-white/80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={32} />
              <div className={`text-white text-[10px] font-bold px-2 py-0.5 inline-block w-max mb-1 ${index % 2 === 0 ? 'bg-blue-500' : 'bg-green-500'}`}>GALERİ</div>
              <h3 className="text-white font-bold text-sm">{img.caption}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
