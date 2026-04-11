import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../db';
import { fetchWithCache, formatTurkishContent, normalizeImageUrl } from '../lib/utils';
import 'react-quill-new/dist/quill.snow.css';
import { Clock, ArrowLeft, Facebook, Twitter, Linkedin, MessageCircle, Share2, ChevronRight, Eye, User } from 'lucide-react';

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
  gallery?: string[];
  tags?: string;
  displayOptions?: {
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

export default function NewsDetail(props: { onReady: () => void }) {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [detailAd, setDetailAd] = useState<AdConfig | null>(null);
  const [sidebarAds, setSidebarAds] = useState<AdConfig[] | null>(null);
  const [categories, setCategories] = useState<{name: string, color: string}[] | null>(null);
  const [sidebarArticles, setSidebarArticles] = useState<Article[] | null>(null);
  const [mostReadArticles, setMostReadArticles] = useState<Article[] | null>(null);

  useEffect(() => {
    let articleLoaded = false;
    let detailAdLoaded = false;
    let sidebarAdsLoaded = false;
    let categoriesLoaded = false;
    let sidebarArticlesLoaded = false;
    const readyRef = { current: false };

    const fetchArticle = async () => {
      if (!id) return;
      try {
        const articleResult = await db.execute({ sql: "SELECT * FROM articles WHERE id = ?", args: [id] });
        if (articleResult.rows.length > 0) {
          const rawArticle = articleResult.rows[0] as any;
          setArticle({
            ...rawArticle,
            isActive: !!rawArticle.isActive,
            displayOptions: typeof rawArticle.displayOptions === 'string' ? JSON.parse(rawArticle.displayOptions) : rawArticle.displayOptions,
            gallery: typeof rawArticle.gallery === 'string' ? JSON.parse(rawArticle.gallery) : (Array.isArray(rawArticle.gallery) ? rawArticle.gallery : [])
          });
        }
        
        try {
          const adData = await fetchWithCache('detail_ad', 'ads');
          if (adData && Array.isArray(adData)) {
            const ads = adData as AdConfig[];
            const detail = ads.find(a => (a as any).id === 'detail');
            if (detail) setDetailAd(detail);
          } else {
            const adResult = await db.execute("SELECT * FROM ads WHERE id = 'detail'");
            if (adResult.rows.length > 0) setDetailAd(adResult.rows[0] as unknown as AdConfig);
          }
        } catch (error) {
          console.error("Error fetching detail ad:", error);
        }
        
        articleLoaded = true;
        detailAdLoaded = true;
        if (articleLoaded && detailAdLoaded && sidebarAdsLoaded && categoriesLoaded && sidebarArticlesLoaded && !readyRef.current) {
          readyRef.current = true;
          props.onReady();
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };

    const fetchCategories = async () => {
      const data = await fetchWithCache('categories', 'categories');
      setCategories(data as {name: string, color: string}[]);
      categoriesLoaded = true;
      if (articleLoaded && detailAdLoaded && sidebarAdsLoaded && categoriesLoaded && sidebarArticlesLoaded && !readyRef.current) {
        readyRef.current = true;
        props.onReady();
      }
    };

    const fetchSidebarAds = async () => {
      const data = await fetchWithCache('sidebarAds', 'sidebarAds');
      setSidebarAds(data as AdConfig[]);
      sidebarAdsLoaded = true;
      if (articleLoaded && detailAdLoaded && sidebarAdsLoaded && categoriesLoaded && sidebarArticlesLoaded && !readyRef.current) {
        readyRef.current = true;
        props.onReady();
      }
    };

    const fetchSidebarArticles = async () => {
      const data = await fetchWithCache('sidebarArticles', 'articles');
      setSidebarArticles((data as Article[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6));
      setMostReadArticles((data as Article[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
      sidebarArticlesLoaded = true;
      if (articleLoaded && detailAdLoaded && sidebarAdsLoaded && categoriesLoaded && sidebarArticlesLoaded && !readyRef.current) {
        readyRef.current = true;
        props.onReady();
      }
    };

    fetchArticle();
    fetchCategories();
    fetchSidebarAds();
    fetchSidebarArticles();
    return () => {};
  }, [id]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} - Haber`;
      
      // Update meta tags for SEO
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', article.summary || article.title);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', article.tags || '');
    }

    return () => {
      // Reset title when leaving the page
      // Home.tsx will set it correctly when it mounts
    };
  }, [article]);

  if (!article || !categories || !sidebarArticles || !mostReadArticles || !sidebarAds) return null;

  if (!article) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Haber bulunamadı.</h2>
        <Link to="/" className="text-red-600 flex items-center justify-center gap-2 font-bold">
          <ArrowLeft size={20} /> Anasayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-6 bg-white p-3 rounded shadow-sm border border-gray-100 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link to="/" className="hover:text-red-600 flex-shrink-0">Anasayfa</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="hover:text-red-600 cursor-pointer flex-shrink-0">{article.category}</span>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-400 line-clamp-1">{article.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <article className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100">
            {/* Header Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4" style={{ backgroundColor: categories.find(c => c.name === article.category)?.color || '#e60026' }}></div>
                <div className="w-1 h-4" style={{ backgroundColor: categories.find(c => c.name === article.category)?.color || '#e60026' }}></div>
                <span className="font-bold tracking-wider cat-label" style={{ color: categories.find(c => c.name === article.category)?.color || '#e60026' }}>{article.category.toUpperCase()}</span>
              </div>
              <div className="text-gray-400 text-xs flex items-center gap-4">
                <span className="flex items-center gap-1"><Eye size={14} /> 283 kez okundu</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-8 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-1">
                <User size={14} className="text-gray-400" />
                <span className="font-bold text-gray-700">{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-gray-400" />
                <span>Yayınlanma Tarihi: {new Date(article.createdAt).toLocaleString('tr-TR')}</span>
              </div>
            </div>

            {/* Main Image */}
            {article.imageUrl && (
              <div className="relative mb-8 group">
                <img 
                  src={normalizeImageUrl(article.imageUrl)} 
                  alt={article.title} 
                  className="w-full h-auto rounded-sm shadow-md"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/seed/news-fallback/1200/600";
                  }}
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-4 text-white text-sm font-bold">
                  {article.title}
                </div>
              </div>
            )}

            {/* Ad Area 1 */}
            <div className="w-full aspect-[3/1] md:aspect-[730/160] md:h-[160px] bg-gray-50 mb-8 border border-gray-500 shadow-md flex items-center justify-center overflow-hidden rounded-sm">
              {detailAd && detailAd.type === 'image' && detailAd.imageUrl ? (
                <a href={detailAd.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <img src={normalizeImageUrl(detailAd.imageUrl)} alt="Reklam" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </a>
              ) : detailAd && detailAd.type === 'code' ? (
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: detailAd.adCode || '' }} />
              ) : (
                <div className="text-gray-300 font-bold text-lg md:text-2xl">Reklam 730x160</div>
              )}
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none text-gray-800 leading-relaxed ql-editor news-content mb-12"
              lang="tr"
            >
              <div dangerouslySetInnerHTML={{ __html: formatTurkishContent(article.content) }} />
            </div>

            {/* Gallery */}
            {article.gallery && article.gallery.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-gray-800 inline-block">Haber Galerisi</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {article.gallery.map((img, idx) => img && (
                    <a key={idx} href={normalizeImageUrl(img)} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-sm overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
                      <img src={normalizeImageUrl(img)} alt={`${article.title} - Galeri ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="flex flex-wrap gap-2 mb-12 py-6 border-t border-gray-100">
              <button className="bg-[#3b5998] text-white p-2 rounded hover:opacity-90 transition-opacity"><Facebook size={20} /></button>
              <button className="bg-[#1da1f2] text-white p-2 rounded hover:opacity-90 transition-opacity"><Twitter size={20} /></button>
              <button className="bg-[#bd081c] text-white p-2 rounded hover:opacity-90 transition-opacity"><Share2 size={20} /></button>
              <button className="bg-[#0077b5] text-white p-2 rounded hover:opacity-90 transition-opacity"><Linkedin size={20} /></button>
              <button className="bg-[#25d366] text-white p-2 rounded hover:opacity-90 transition-opacity"><MessageCircle size={20} /></button>
            </div>

            {/* Reactions */}
            <div className="bg-gray-50 p-6 rounded-lg mb-12">
              <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                {[
                  { label: 'Beğendim', emoji: '😊' },
                  { label: 'Şaşırdım', emoji: '😮' },
                  { label: 'Komik', emoji: '😂' },
                  { label: 'Beğenmedim', emoji: '😒' },
                  { label: 'Üzüldüm', emoji: '😢' },
                  { label: 'Kızdım', emoji: '😡' }
                ].map((react) => (
                  <div key={react.label} className="text-center cursor-pointer group">
                    <div className="text-4xl mb-2 transition-transform group-hover:scale-110">{react.emoji}</div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase">{react.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Area 2 */}
            <div className="w-full aspect-[3/1] md:aspect-[730/160] md:h-[160px] bg-gray-50 mb-12 border border-gray-500 shadow-md flex items-center justify-center overflow-hidden rounded-sm">
              {detailAd && detailAd.type === 'image' && detailAd.imageUrl ? (
                <a href={detailAd.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <img src={normalizeImageUrl(detailAd.imageUrl)} alt="Reklam" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </a>
              ) : detailAd && detailAd.type === 'code' ? (
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: detailAd.adCode || '' }} />
              ) : (
                <div className="text-gray-300 font-bold text-lg md:text-2xl">Reklam 730x160</div>
              )}
            </div>

            {/* Comment Form */}
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-gray-800 inline-block">Yorum Gönder</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Adınız Soyadınız *" className="p-3 border border-gray-200 rounded focus:ring-1 focus:ring-red-500 outline-none text-sm" />
                <input type="email" placeholder="E-Posta Adresiniz" className="p-3 border border-gray-200 rounded focus:ring-1 focus:ring-red-500 outline-none text-sm" />
                <textarea placeholder="Yorumunuz *" className="md:col-span-2 p-3 border border-gray-200 rounded h-32 focus:ring-1 focus:ring-red-500 outline-none text-sm" />
                <button type="submit" className="bg-red-600 text-white px-8 py-3 rounded font-bold hover:bg-red-700 transition-colors w-max">YORUMU GÖNDER</button>
              </form>
            </div>

            {/* Comments List */}
            <div>
              <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-gray-800 inline-block">Yorumlar</h3>
              <div className="bg-blue-50 p-4 rounded text-blue-800 text-sm italic">
                Henüz yorum yapılmamış. <span className="font-bold cursor-pointer hover:underline">İlk yorumu sen yap!</span>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Manşet Haberleri */}
          <div className="bg-white p-4 border border-gray-100 shadow-sm rounded-sm">
            <div className="mb-6">
              <div className="inline-block bg-black text-white px-4 py-2 font-bold clip-path-category">
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
                      <div className="absolute top-2 left-2 text-white cat-label px-1 font-bold uppercase" style={{ backgroundColor: categories.find(c => c.name === news.category)?.color || '#f97316' }}>{news.category}</div>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-red-600">{news.title}</h4>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Ads Section (Top) - Show only the first ad */}
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
                            e.currentTarget.src = "https://picsum.photos/seed/news-fallback/300/300";
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

          {/* Sidebar Ads Section (Bottom) - Show second and subsequent ads */}
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
