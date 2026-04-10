import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { fetchWithCache, normalizeImageUrl } from '../lib/utils';
import { Clock, ChevronRight, Eye, User } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  summary?: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
  imageUrl: string;
  isActive: boolean;
}

interface AdConfig {
  id?: string;
  type: 'image' | 'code';
  imageUrl?: string;
  adCode?: string;
  link?: string;
}

interface ServiceLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb: string;
}

export default function ServiceLayout({ children, title, breadcrumb }: ServiceLayoutProps) {
  const [sidebarAds, setSidebarAds] = useState<AdConfig[] | null>(null);
  const [categories, setCategories] = useState<{name: string, color: string}[] | null>(null);
  const [sidebarArticles, setSidebarArticles] = useState<Article[] | null>(null);
  const [mostReadArticles, setMostReadArticles] = useState<Article[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await fetchWithCache('categories', 'categories');
        setCategories(cats as {name: string, color: string}[]);

        const ads = await fetchWithCache('sidebarAds', 'sidebarAds');
        setSidebarAds(ads as AdConfig[]);

        const articles = await fetchWithCache('sidebarArticles', 'articles');
        const sortedArticles = (articles as Article[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSidebarArticles(sortedArticles.slice(0, 6));
        setMostReadArticles(sortedArticles.slice(0, 5));
      } catch (error) {
        console.error("Error fetching service layout data:", error);
      }
    };

    fetchData();
  }, []);

  if (!categories || !sidebarArticles || !mostReadArticles || !sidebarAds) return null;

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-6 bg-white p-3 rounded shadow-sm border border-gray-100 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link to="/" className="hover:text-red-600 flex-shrink-0">Anasayfa</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-400 line-clamp-1">{breadcrumb}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100 min-h-[600px]">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
              {title}
            </h1>
            {children}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Manşet Haberleri */}
          <div className="bg-white p-4 border border-gray-100 shadow-sm rounded-sm">
            <div className="mb-6">
              <div className="inline-block bg-black text-white px-4 py-2 font-bold text-sm clip-path-category">
                Manşet Haberleri
              </div>
              <div className="border-b-2 border-black mt-[-2px]"></div>
            </div>
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sidebarArticles.map((news) => (
                  <Link key={news.id} to={`/news/${news.id}`} className="group">
                    <div className="relative aspect-video overflow-hidden rounded mb-2">
                      {news.imageUrl && (
                        <img src={normalizeImageUrl(news.imageUrl)} alt="" className="news-image transition-transform group-hover:scale-110" />
                      )}
                      <div className="absolute top-2 left-2 text-white text-[8px] px-1 font-bold uppercase" style={{ backgroundColor: categories.find(c => c.name === news.category)?.color || '#f97316' }}>{news.category}</div>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-red-600">{news.title}</h4>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Ads Section (Top) */}
          {sidebarAds && sidebarAds.length > 0 && (
            <div className="space-y-6 flex flex-col items-center">
              {sidebarAds.slice(0, 1).map((ad, idx) => (
                <div key={`top-${ad.id || idx}`} className="w-full max-w-[350px] aspect-[350/262] bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden rounded-sm">
                  {ad.type === 'image' && ad.imageUrl ? (
                    <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      <img src={normalizeImageUrl(ad.imageUrl)} alt="Reklam" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </a>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: ad.adCode || '' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Çok Okunanlar */}
          <div className="bg-white p-4 border border-gray-100 shadow-sm rounded-sm">
            <div className="mb-6">
              <div className="inline-block bg-black text-white px-6 py-2 font-bold text-sm clip-path-tab">
                Çok Okunanlar
              </div>
              <div className="border-b border-gray-200 mt-[-1px]"></div>
            </div>
            <section>
              <div className="space-y-6">
                {mostReadArticles.map((news) => (
                  <Link key={news.id} to={`/news/${news.id}`} className="flex gap-4 group">
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-sm">
                      {news.imageUrl && (
                        <img 
                          src={normalizeImageUrl(news.imageUrl)} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/seed/plumbing/300/300";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5 font-medium">
                        <Clock size={14} className="text-gray-400" /> 
                        {new Date(news.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}, {new Date(news.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-3 group-hover:text-red-600 transition-colors leading-snug">
                        {news.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Ads Section (Bottom) */}
          {sidebarAds && sidebarAds.length > 1 && (
            <div className="space-y-6 flex flex-col items-center">
              {sidebarAds.slice(1).map((ad, idx) => (
                <div key={`bottom-${ad.id || idx}`} className="w-full max-w-[350px] aspect-[350/262] bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden rounded-sm">
                  {ad.type === 'image' && ad.imageUrl ? (
                    <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      <img src={normalizeImageUrl(ad.imageUrl)} alt="Reklam" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </a>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: ad.adCode || '' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
