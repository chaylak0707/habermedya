/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { db } from './db';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import NewsDetail from './pages/NewsDetail';
import CategoryPage from './pages/CategoryPage';
import StockMarket from './pages/StockMarket';
import DutyPharmacies from './pages/DutyPharmacies';
import Weather from './pages/Weather';
import PrayerTimes from './pages/PrayerTimes';
import TrafficStatus from './pages/TrafficStatus';
import MatchResults from './pages/MatchResults';
import Directory from './pages/Directory';
import AddCompany from './pages/AddCompany';
import { AppDataContext } from './AppDataContext';
import { fetchWithCache } from './lib/utils';
import ScrollToTop from './components/ScrollToTop';

function AppContent({ data }: { data: any }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ScrollToTop />
      {!isAdminPage && <Header />}
      <main className={isAdminPage ? "flex-1" : "max-w-[1280px] mx-auto px-2 sm:px-4 py-4 sm:py-8 flex-1"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/news/:id" element={<NewsDetail onReady={() => {}} />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/servis/borsa" element={<StockMarket />} />
          <Route path="/servis/nobetci-ezcaneler" element={<DutyPharmacies />} />
          <Route path="/servis/hava-durumu" element={<Weather />} />
          <Route path="/servis/namaz-vakitleri" element={<PrayerTimes />} />
          <Route path="/servis/trafik-durumu" element={<TrafficStatus />} />
          <Route path="/servis/mac-sonuclari" element={<MatchResults />} />
          <Route path="/rehber" element={<Directory />} />
          <Route path="/rehber/firma-ekle" element={<AddCompany />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<any>({ 
    logoUrl: '', 
    siteName: '', 
    articles: [], 
    categories: [], 
    menus: [],
    serviceBgs: {
      stock: '',
      pharmacy: '',
      weather: '',
      prayer: '',
      traffic: '',
      results: ''
    }
  });
  const [isReady, setIsReady] = useState(false);

  const fetchData = async () => {
    try {
      const configResult = await db.execute("SELECT * FROM config WHERE id = 'site'");
      const configData = (configResult.rows[0] || {}) as any;
      console.log("Config fetched.");

      console.log("Fetching articles...");
      const articlesData = await fetchWithCache('articles', 'articles');
      console.log("Articles fetched.");

      console.log("Fetching categories...");
      const categoriesData = await fetchWithCache('categories', 'categories');
      console.log("Categories fetched.");

      console.log("Fetching menus...");
      const menusResponse = await fetch('/api/menus');
      const menusData = await menusResponse.json();
      console.log("Menus fetched.");
      
      console.log("Fetched initial data successfully.");

      setData({
        logoUrl: (configData.logoUrl as string) || '',
        siteName: (configData.siteName as string) || 'DİNÇ SIHHİ TESİSAT',
        footerText: (configData.footerText as string) || '© 2026 DİNÇ SIHHİ TESİSAT. Tüm hakları saklıdır.',
        articles: (articlesData as any[]).map(article => ({
          ...article,
          isActive: !!article.isActive,
          displayOptions: typeof article.displayOptions === 'string' ? JSON.parse(article.displayOptions) : article.displayOptions
        })),
        categories: (categoriesData as any[]).map(cat => ({
          ...cat,
          showInMenu: !!cat.showInMenu,
          showOnHomepage: !!cat.showOnHomepage,
          isActive: cat.isActive === undefined ? true : !!cat.isActive
        })),
        menus: Array.isArray(menusData) ? menusData : [],
        serviceBgs: {
          stock: configData.stockBg || '',
          pharmacy: configData.pharmacyBg || '',
          weather: configData.weatherBg || '',
          prayer: configData.prayerBg || '',
          traffic: configData.trafficBg || '',
          results: configData.resultsBg || ''
        }
      });
    } catch (error: any) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!isReady) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <AppDataContext.Provider value={{ ...data, refreshData: fetchData }}>
      <Router>
        <AppContent data={data} />
      </Router>
    </AppDataContext.Provider>
  );
}
