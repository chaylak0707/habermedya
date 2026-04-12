import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import PhotoGallery from '../components/PhotoGallery';
import MarketBar from '../components/MarketBar';
import ServiceCards from '../components/ServiceCards';
import { useAppData } from '../AppDataContext';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithCache, normalizeImageUrl } from '../lib/utils';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
  imageUrl: string;
  isActive: boolean;
  tags?: string;
  displayOptions: {
    isSlider: boolean;
    isFeatured: boolean;
    isCategory: boolean;
    isSidebar: boolean;
    isBreaking: boolean;
  };
}

interface AdConfig {
  id?: string;
  type: 'image' | 'code';
  imageUrl?: string;
  adCode?: string;
  link?: string;
}

export default function Home() {
  const { articles: initialArticles, siteName } = useAppData() as any;
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<{name: string, color: string, showOnHomepage?: boolean}[]>([]);
  const [homeAd, setHomeAd] = useState<AdConfig | null>(null);
  const [activeSliderIndex, setActiveSliderIndex] = useState(0);
  const [siteConfig, setSiteConfig] = useState<{siteTitle?: string, siteDescription?: string, siteKeywords?: string} | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const result = await db.execute("SELECT siteTitle, siteDescription, siteKeywords FROM config WHERE id = 'site'");
        if (result.rows.length > 0) {
          const config = result.rows[0] as any;
          setSiteConfig(config);
          
          if (config.siteTitle) {
            document.title = config.siteTitle;
          } else {
            document.title = siteName || 'DİNÇ SIHHİ TESİSAT';
          }
          
          // Update meta tags
          if (config.siteDescription) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.setAttribute('name', 'description');
              document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', config.siteDescription);
          }

          if (config.siteKeywords) {
            let metaKey = document.querySelector('meta[name="keywords"]');
            if (!metaKey) {
              metaKey = document.createElement('meta');
              metaKey.setAttribute('name', 'keywords');
              document.head.appendChild(metaKey);
            }
            metaKey.setAttribute('content', config.siteKeywords);
          }
        } else {
          document.title = siteName || 'DİNÇ SIHHİ TESİSAT';
        }
      } catch (error) {
        console.error("Error fetching site config:", error);
        document.title = siteName || 'DİNÇ SIHHİ TESİSAT';
      }
    };
    fetchConfig();
  }, [siteName]);

  useEffect(() => {
    const fetchData = async () => {
      const articlesData = (await fetchWithCache('articles', 'articles')) as any[];
      const sortedArticles = [...articlesData].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      const parsedArticles = sortedArticles.map(article => ({
        ...article,
        isActive: !!article.isActive,
        displayOptions: typeof article.displayOptions === 'string' ? JSON.parse(article.displayOptions) : article.displayOptions,
        gallery: typeof article.gallery === 'string' ? JSON.parse(article.gallery) : (Array.isArray(article.gallery) ? article.gallery : [])
      }));
      setArticles(parsedArticles.filter(a => a.isActive !== false));

      const cats = (await fetchWithCache('categories', 'categories')) as {name: string, color: string, showOnHomepage?: boolean}[];
      setCategories(cats);
    };

    fetchData();

    const fetchAd = async () => {
      try {
        const adData = await fetchWithCache('home_ad', 'ads');
        if (adData && Array.isArray(adData)) {
          const ads = adData as AdConfig[];
          
          const home = ads.find(a => a.id === 'home');
          if (home) setHomeAd(home);
        } else {
          // Fallback to direct fetch if cache is invalid
          const adResult = await db.execute("SELECT * FROM ads");
          if (adResult && adResult.rows) {
            adResult.rows.forEach((row: any) => {
              if (row.id === 'home') setHomeAd(row);
            });
          }
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAd();
  }, []);

  const sliderArticles = articles.filter(a => a.displayOptions?.isSlider).slice(0, 17);
  const sidebarArticles = articles.filter(a => a.displayOptions?.isSidebar).slice(0, 4);
  const featuredArticles = articles.filter(a => a.displayOptions?.isFeatured).slice(0, 6);
  const categoryArticles = articles.filter(a => a.isActive);

  const homeCategories = categories.filter(c => c.showOnHomepage === true && c.isActive !== false);
  const displayCategories = homeCategories.length > 0 ? homeCategories : categories.filter(c => c.isActive !== false).slice(0, 3);

  useEffect(() => {
    if (sliderArticles.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveSliderIndex((prev) => (prev + 1) % sliderArticles.length);
    }, 5000);
    
    return () => { clearInterval(interval); };
  }, [sliderArticles.length]);

  const mainArticle = sliderArticles[activeSliderIndex] || articles[0];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-12 items-stretch">
        {/* Main Manşet */}
        <div className="lg:col-span-2 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={mainArticle?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col"
            >
              <Link to={mainArticle ? `/news/${mainArticle.id}` : "#"} className="block group flex-1 flex flex-col">
                <div className="relative flex-1 min-h-[300px] sm:min-h-[350px] md:min-h-[435px] bg-gray-300 rounded-sm overflow-hidden">
                  <img 
                    src={normalizeImageUrl(mainArticle?.imageUrl)} 
                    alt={mainArticle?.title || "Manşet"} 
                    className="w-full h-full absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105" 
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/seed/news-fallback/1200/600";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 md:p-8 text-white">
                    <span className="px-2 py-1 cat-label font-bold mb-2 inline-block rounded-sm" style={{ backgroundColor: categories.find(c => c.name === (mainArticle?.category || 'SİYASET'))?.color || '#e60026' }}>
                      {mainArticle?.category?.toUpperCase() || 'SİYASET'}
                    </span>
                    <h1 className="text-base sm:text-lg md:text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
                      {mainArticle?.title}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] md:text-sm opacity-90 font-medium">
                      <Clock size={14} className="w-3 h-3 md:w-4 md:h-4" /> 
                      {mainArticle ? new Date(mainArticle.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
          {/* Pagination */}
          <div className="w-full mt-auto">
            <div className="flex flex-wrap -mt-1 border-l border-b border-gray-200 bg-white">
              {sliderArticles.map((_, i) => (
                <div 
                  key={i} 
                  onMouseEnter={() => setActiveSliderIndex(i)}
                  onClick={() => setActiveSliderIndex(i)}
                  className={`flex-none w-10 sm:flex-1 text-center py-2 sm:py-[10.5px] flex items-center justify-center text-xs sm:text-[15px] font-bold border-r border-b border-gray-200 cursor-pointer transition-colors ${i === activeSliderIndex ? 'bg-[#e60026] text-white' : 'bg-white hover:bg-gray-100 text-gray-800'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Sidebar */}
        <div className="lg:col-span-1 bg-white border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex flex-col divide-y divide-gray-100">
            {sidebarArticles.map((news, index) => (
              <Link 
                key={news.id} 
                to={`/news/${news.id}`} 
                className="flex-1 flex items-center gap-3 md:gap-4 px-4 py-2 group min-h-0"
              >
                <div className="flex-1 min-w-0">
                  <span className="px-1.5 py-0.5 cat-label font-bold text-white uppercase rounded-sm" style={{ backgroundColor: categories.find(c => c.name === news.category)?.color || '#e60026' }}>
                    {news.category}
                  </span>
                  <p className="text-[9px] text-gray-400 mt-1 font-medium">
                    {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <h3 className="text-xs md:text-sm lg:text-base font-bold text-gray-800 mt-1 group-hover:text-[#e60026] transition-colors line-clamp-2 leading-tight">
                    {news.title}
                  </h3>
                </div>
                <div className="w-24 h-16 md:w-28 md:h-20 flex-shrink-0 overflow-hidden rounded-sm">
                  <img 
                    src={normalizeImageUrl(news.imageUrl)} 
                    alt={news.title} 
                    className="news-image transition-transform duration-500 group-hover:scale-110" 
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/seed/news-fallback/400/300";
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
          {sidebarArticles.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic py-12">
              Manşet yanı haberi bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* Service Cards */}
      <ServiceCards />

      {/* Market and Weather Bar */}
      <MarketBar />

      {/* Öne Çıkan Haberler */}
      <div className="relative mb-6">
        <div className="flex items-center border-b-2 border-gray-800">
          <div className="bg-gray-800 text-white px-4 md:px-6 py-2 text-sm md:text-base font-bold relative clip-path-tab">
            Öne Çıkan Haberler
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {featuredArticles.map((news) => (
            <Link key={news.id} to={`/news/${news.id}`} className="bg-white shadow-sm border border-gray-200 group flex flex-col">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={normalizeImageUrl(news.imageUrl) || 'https://picsum.photos/seed/f/400/250'} 
                  alt={news.title} 
                  className="news-image transition-transform duration-500 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/seed/news-fallback/400/250";
                  }}
                />
              </div>
              <div className="p-3 md:p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 cat-label font-bold text-white uppercase rounded-sm" style={{ backgroundColor: categories.find(c => c.name === news.category)?.color || '#e60026' }}>
                    {news.category}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-400 font-medium">
                    <Clock size={12} className="w-3 h-3" /> {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-bold text-gray-800 group-hover:text-[#e60026] transition-colors line-clamp-2 leading-snug">
                  {news.title}
                </h3>
              </div>
            </Link>
          ))}
          {featuredArticles.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-12 bg-white border border-dashed rounded-lg">
              Öne çıkan haber bulunamadı.
            </p>
          )}
        </div>

      {/* Homepage Ad Area */}
      <div className="my-6 bg-gray-50 border border-gray-500 flex items-center justify-center overflow-hidden min-h-[160px] shadow-md rounded-sm">
        {homeAd && homeAd.type === 'image' && homeAd.imageUrl ? (
          <a href={homeAd.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
            <img 
              src={normalizeImageUrl(homeAd.imageUrl)} 
              alt="Reklam" 
              className="w-full h-[160px] object-cover" 
              referrerPolicy="no-referrer" 
              loading="lazy" 
            />
          </a>
        ) : homeAd && homeAd.type === 'code' && homeAd.adCode ? (
          <div 
            className="w-full flex justify-center"
            dangerouslySetInnerHTML={{ __html: homeAd.adCode }}
          />
        ) : (
          <div className="text-gray-300 font-bold text-lg md:text-2xl uppercase tracking-widest">
            1280x160px
          </div>
        )}
      </div>

      <div className="mt-0">
        <PhotoGallery />
      </div>

      {/* Kategori Haberleri */}
      {displayCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-12">
          {displayCategories.map((cat, index) => {
            const catArticles = categoryArticles.filter(a => a.category?.toUpperCase() === (cat.name || '').toUpperCase()).slice(0, 4);
            const firstArticle = catArticles[0];
            const otherArticles = catArticles.slice(1);

            return (
              <div key={cat.name ? `cat-${cat.name}` : `cat-idx-${index}`} className="flex flex-col">
                {/* Category Header */}
                <div className="relative h-9 mb-6">
                  <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ backgroundColor: cat.color }}></div>
                  <div 
                    className="absolute left-0 top-0 h-full px-6 flex items-center text-white font-black tracking-widest clip-path-category"
                    style={{ 
                      backgroundColor: cat.color,
                      clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)'
                    }}
                  >
                    {cat.name.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-5">
                  {firstArticle ? (
                    <>
                      {/* Main Category Article */}
                      <Link to={`/news/${firstArticle.id}`} className="block group relative aspect-[16/10] overflow-hidden rounded-sm shadow-sm">
                        <img 
                          src={normalizeImageUrl(firstArticle.imageUrl) || 'https://picsum.photos/seed/cat/400/300'} 
                          alt={firstArticle.title} 
                          className="news-image transition-transform duration-700 group-hover:scale-110" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/seed/news-fallback/400/300";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                          <div className="flex items-center gap-1.5 text-[11px] text-white/90 mb-2 font-medium">
                            <Clock size={13} className="text-white/80" />
                            {new Date(firstArticle.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + new Date(firstArticle.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <h4 className="text-white font-bold text-lg leading-tight group-hover:text-red-400 transition-colors line-clamp-3">
                            {firstArticle.title}
                          </h4>
                        </div>
                      </Link>

                      {/* Other Category Articles */}
                      <div className="space-y-5">
                        {otherArticles.map((news) => (
                          <Link key={news.id} to={`/news/${news.id}`} className="flex gap-3.5 group">
                            <div className="w-24 h-16 flex-shrink-0 overflow-hidden rounded-sm border border-gray-100">
                              <img 
                                src={normalizeImageUrl(news.imageUrl) || 'https://picsum.photos/seed/cat/100/70'} 
                                alt={news.title} 
                                className="news-image transition-transform duration-500 group-hover:scale-110" 
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = "https://picsum.photos/seed/news-fallback/100/70";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1.5 font-medium">
                                <Clock size={11} />
                                {new Date(news.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + new Date(news.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <h5 className="text-[13px] font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                                {news.title}
                              </h5>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center bg-gray-50 rounded border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 italic">Bu kategoride henüz haber yok.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
