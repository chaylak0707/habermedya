import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { slugify, fetchWithCache, normalizeImageUrl } from '../lib/utils';

interface Article {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<{name: string, color: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      const articlesData = (await fetchWithCache('articles', 'articles')) as Article[];
      const sortedArticles = [...articlesData].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      const filteredArticles = sortedArticles.filter(a => a.isActive !== false && slugify(a.category || '') === slug);
      setArticles(filteredArticles);

      const categoriesData = (await fetchWithCache('categories', 'categories')) as {name: string, color: string}[];
      setCategories(categoriesData);
      
      const categoryName = categoriesData.find(c => slugify(c.name) === slug)?.name || slug;
      document.title = `${categoryName} Haberleri - DİNÇ SIHHİ TESİSAT`;
      
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#0099ff';
  };

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="w-full py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">{slug} Haberleri</h1>
      
      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-600">Bu kategoride henüz haber bulunmuyor.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.id} to={`/news/${article.id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={normalizeImageUrl(article.imageUrl)} 
                  alt={article.title} 
                  className="news-image" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/seed/plumbing/800/450";
                  }}
                />
                <div 
                  className="absolute top-2 left-2 text-white cat-label font-bold px-2 py-1 uppercase"
                  style={{ backgroundColor: getCategoryColor(article.category) }}
                >
                  {article.category}
                </div>
              </div>
              <div className="p-4">
                <div className="text-gray-500 text-xs mb-2 flex items-center">
                  <span className="mr-1">🕒</span>
                  {new Date(article.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{article.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
