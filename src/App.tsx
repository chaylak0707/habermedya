import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

function AppContent({ data }: { data: any }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
  const [data, setData] = useState({
    logoUrl: '',
    siteName: '',
    footerText: '',
    articles: [],
    categories: [],
    menus: []
  });

  const [isReady, setIsReady] = useState(false);

  const fetchData = async () => {
    try {
      console.log("Fetching config...");
      const configRes = await fetch('/api/config');
      const configData = await configRes.json();

      console.log("Fetching articles...");
      const articlesData = await fetchWithCache('articles', 'articles');

      console.log("Fetching categories...");
      const categoriesData = await fetchWithCache('categories', 'categories');

      console.log("Fetching menus...");
      const menusRes = await fetch('/api/menus');
      const menusData = await menusRes.json();

      setData({
        logoUrl: configData.logoUrl || '',
        siteName: configData.siteName || 'DİNÇ SIHHİ TESİSAT',
        footerText: configData.footerText || '',
        articles: (articlesData || []).map((a: any) => ({
          ...a,
          isActive: !!a.isActive,
          displayOptions: typeof a.displayOptions === 'string'
            ? JSON.parse(a.displayOptions)
            : a.displayOptions
        })),
        categories: (categoriesData || []).map((c: any) => ({
          ...c,
          name: c.name || '',
          showInMenu: !!c.showInMenu,
          showOnHomepage: !!c.showOnHomepage,
          isActive: c.isActive === undefined ? true : !!c.isActive
        })),
        menus: (menusData || []).map((m: any) => ({
          ...m,
          name: m.name || ''
        }))
      });

    } catch (error) {
      console.error("DATA ERROR:", error);
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
