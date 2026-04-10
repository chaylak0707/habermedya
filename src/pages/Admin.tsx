import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { useAppData } from '../AppDataContext';
import { fetchWithCache, clearCache, normalizeImageUrl } from '../lib/utils';
import ReactQuill from 'react-quill-new';
const ReactQuillAny = ReactQuill as any;
import 'react-quill-new/dist/quill.snow.css';
import { 
  Trash2, Plus, Settings, Image as ImageIcon, Layout, 
  ToggleLeft, ToggleRight, Megaphone, LogIn, LogOut, 
  ShieldAlert, Bell, User, Search, Check, X, Edit3,
  ChevronRight, MoreVertical, Grid, FileText, PieChart,
  Home, List, FolderPlus, Activity, Globe, Monitor, ExternalLink, Menu,
  Filter, Loader2, Clock, Building2, MessageCircle, MapPin, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Login from '../components/Login';

const IOSSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: (val: boolean) => void, label?: string }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    {label && <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>}
    <div 
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out ${checked ? 'bg-red-600' : 'bg-gray-200'}`}
    >
      <div 
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </div>
  </label>
);

const CitySelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)} 
    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold text-gray-800"
  >
    <option value="adana">Adana</option>
    <option value="adiyaman">Adıyaman</option>
    <option value="afyon">Afyonkarahisar</option>
    <option value="agri">Ağrı</option>
    <option value="amasya">Amasya</option>
    <option value="ankara">Ankara</option>
    <option value="antalya">Antalya</option>
    <option value="artvin">Artvin</option>
    <option value="aydin">Aydın</option>
    <option value="balikesir">Balıkesir</option>
    <option value="bilecik">Bilecik</option>
    <option value="bingol">Bingöl</option>
    <option value="bitlis">Bitlis</option>
    <option value="bolu">Bolu</option>
    <option value="burdur">Burdur</option>
    <option value="bursa">Bursa</option>
    <option value="canakkale">Çanakkale</option>
    <option value="cankiri">Çankırı</option>
    <option value="corum">Çorum</option>
    <option value="denizli">Denizli</option>
    <option value="diyarbakir">Diyarbakır</option>
    <option value="edirne">Edirne</option>
    <option value="elazig">Elazığ</option>
    <option value="erzincan">Erzincan</option>
    <option value="erzurum">Erzurum</option>
    <option value="eskisehir">Eskişehir</option>
    <option value="gaziantep">Gaziantep</option>
    <option value="giresun">Giresun</option>
    <option value="gumushane">Gümüşhane</option>
    <option value="hakkari">Hakkari</option>
    <option value="hatay">Hatay</option>
    <option value="isparta">Isparta</option>
    <option value="mersin">Mersin</option>
    <option value="istanbul">İstanbul</option>
    <option value="izmir">İzmir</option>
    <option value="kars">Kars</option>
    <option value="kastamonu">Kastamonu</option>
    <option value="kayseri">Kayseri</option>
    <option value="kirklareli">Kırklareli</option>
    <option value="kirsehir">Kırşehir</option>
    <option value="kocaeli">Kocaeli</option>
    <option value="konya">Konya</option>
    <option value="kutahya">Kütahya</option>
    <option value="malatya">Malatya</option>
    <option value="manisa">Manisa</option>
    <option value="kahramanmaras">Kahramanmaraş</option>
    <option value="mardin">Mardin</option>
    <option value="mugla">Muğla</option>
    <option value="mus">Muş</option>
    <option value="nevsehir">Nevşehir</option>
    <option value="nigde">Niğde</option>
    <option value="ordu">Ordu</option>
    <option value="rize">Rize</option>
    <option value="sakarya">Sakarya</option>
    <option value="samsun">Samsun</option>
    <option value="siirt">Siirt</option>
    <option value="sinop">Sinop</option>
    <option value="sivas">Sivas</option>
    <option value="tekirdag">Tekirdağ</option>
    <option value="tokat">Tokat</option>
    <option value="trabzon">Trabzon</option>
    <option value="tunceli">Tunceli</option>
    <option value="sanliurfa">Şanlıurfa</option>
    <option value="usak">Uşak</option>
    <option value="van">Van</option>
    <option value="yozgat">Yozgat</option>
    <option value="zonguldak">Zonguldak</option>
    <option value="aksaray">Aksaray</option>
    <option value="bayburt">Bayburt</option>
    <option value="karaman">Karaman</option>
    <option value="kirikkale">Kırıkkale</option>
    <option value="batman">Batman</option>
    <option value="sirnak">Şırnak</option>
    <option value="bartin">Bartın</option>
    <option value="ardahan">Ardahan</option>
    <option value="igdir">Iğdır</option>
    <option value="yalova">Yalova</option>
    <option value="karabuk">Karabük</option>
    <option value="kilis">Kilis</option>
    <option value="osmaniye">Osmaniye</option>
    <option value="duzce">Düzce</option>
  </select>
);

const DistrictSelect = ({ value, onChange, city }: { value: string, onChange: (val: string) => void, city: string }) => {
  const mersinDistricts = [
    { id: 'akdeniz', name: 'Akdeniz' },
    { id: 'yenisehir', name: 'Yenişehir' },
    { id: 'mezitli', name: 'Mezitli' },
    { id: 'toroslar', name: 'Toroslar' },
    { id: 'tarsus', name: 'Tarsus' },
    { id: 'erdemli', name: 'Erdemli' },
    { id: 'silifke', name: 'Silifke' },
    { id: 'anamur', name: 'Anamur' },
    { id: 'aydincik', name: 'Aydıncık' },
    { id: 'bozyazi', name: 'Bozyazı' },
    { id: 'camliyayla', name: 'Çamlıyayla' },
    { id: 'gulnar', name: 'Gülnar' },
    { id: 'mut', name: 'Mut' }
  ];

  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold text-gray-800"
    >
      <option value="">İlçe Seçin (Opsiyonel)</option>
      {city.toLowerCase() === 'mersin' && mersinDistricts.map(d => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
      {city.toLowerCase() !== 'mersin' && value && (
        <option value={value}>{value}</option>
      )}
    </select>
  );
};

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
  gallery: string[];
  tags: string;
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

interface TopMenuLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  orderIndex: number;
  position: 'left' | 'right';
}

interface Menu {
  id: string;
  title: string;
  url: string;
  order: number;
  is_active: boolean;
  parent_id: string | null;
}

export default function Admin() {
  const { refreshData } = useAppData() as any;
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Gündem');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOptions, setDisplayOptions] = useState({
    isSlider: false,
    isFeatured: false,
    isCategory: true,
    isSidebar: false,
    isBreaking: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAds, setIsSavingAds] = useState(false);
  const [isFixingAds, setIsFixingAds] = useState(false);
  const [isUploadingAd, setIsUploadingAd] = useState<string | null>(null);
  const [adUploadProgress, setAdUploadProgress] = useState<{[key: string]: number}>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [articleGallery, setArticleGallery] = useState<string[]>([]);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const quillRef = useRef<ReactQuill>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('DİNÇ SIHHİ TESİSAT');
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteKeywords, setSiteKeywords] = useState('');
  const [footerText, setFooterText] = useState('© 2026 DİNÇ SIHHİ TESİSAT. Tüm hakları saklıdır.');
  const [serviceCity, setServiceCity] = useState('mersin');
  const [pharmacyCity, setPharmacyCity] = useState('mersin');
  const [pharmacyDistrict, setPharmacyDistrict] = useState('');
  const [weatherCity, setWeatherCity] = useState('mersin');
  const [weatherDistrict, setWeatherDistrict] = useState('');
  const [trafficCity, setTrafficCity] = useState('mersin');
  const [trafficDistrict, setTrafficDistrict] = useState('');
  const [prayerCity, setPrayerCity] = useState('mersin');
  const [prayerDistrict, setPrayerDistrict] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'settings' | 'gallery' | 'ads' | 'categories' | 'top-menu' | 'service-settings' | 'companies' | 'menus' | 'users'>('dashboard');
  const [admin, setAdmin] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminUser, setNewAdminUser] = useState({ username: '', password: '', role: 'admin' });
  const [passwordChange, setPasswordChange] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [categories, setCategories] = useState<{id: string, name: string, showInMenu: boolean, showOnHomepage: boolean, color: string, isActive: boolean}[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);
  const [newMenu, setNewMenu] = useState<Omit<Menu, 'id'>>({ title: '', url: '', order: 0, is_active: true, parent_id: null });
  const [companies, setAdminCompanies] = useState<any[]>([]);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    category: '',
    authorizedPerson: '',
    phone: '',
    whatsapp: '',
    address: '',
    district: '',
    website: '',
    description: '',
    isApproved: 0
  });
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', showInMenu: true, showOnHomepage: false, color: '#e60026', isActive: true });
  const [filterCategory, setFilterCategory] = useState('Tümü');
  const [galleryImages, setGalleryImages] = useState<{id: string, url: string, caption?: string}[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [homeAd, setHomeAd] = useState<AdConfig>({ type: 'image', imageUrl: '', adCode: '', link: '' });
  const [homeTopAd, setHomeTopAd] = useState<AdConfig>({ type: 'image', imageUrl: '', adCode: '', link: '' });
  const [detailAd, setDetailAd] = useState<AdConfig>({ type: 'image', imageUrl: '', adCode: '', link: '' });
  const [sidebarAds, setSidebarAds] = useState<AdConfig[]>([]);
  const [newSidebarAd, setNewSidebarAd] = useState<AdConfig>({ type: 'image', imageUrl: '', adCode: '', link: '' });

  const [topMenuLinks, setTopMenuLinks] = useState<TopMenuLink[]>([]);
  const [editingTopMenuId, setEditingTopMenuId] = useState<string | null>(null);
  const [deletingTopMenuId, setDeletingTopMenuId] = useState<string | null>(null);
  const [newTopMenuLink, setNewTopMenuLink] = useState<Omit<TopMenuLink, 'id'>>({ title: '', url: '', icon: '', orderIndex: 0, position: 'right' });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/me');
      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
        fetchData();
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAdmin(null);
  };

  const fetchData = async () => {
    if (!admin) return;
    try {
      // Admin panel should always get fresh data
      const articlesResult = await db.execute("SELECT * FROM articles");
      setArticles((articlesResult.rows as any[]).map(article => ({
        ...article,
        isActive: !!article.isActive,
        displayOptions: typeof article.displayOptions === 'string' ? JSON.parse(article.displayOptions) : article.displayOptions,
        gallery: typeof article.gallery === 'string' ? JSON.parse(article.gallery) : (Array.isArray(article.gallery) ? article.gallery : [])
      })));

      const galleryResult = await db.execute("SELECT * FROM gallery ORDER BY createdAt DESC");
      setGalleryImages(galleryResult.rows as {id: string, url: string, caption?: string}[]);

      const categoriesResult = await db.execute("SELECT * FROM categories");
      setCategories((categoriesResult.rows as any[]).map(cat => ({
        ...cat,
        showInMenu: !!cat.showInMenu,
        showOnHomepage: !!cat.showOnHomepage,
        isActive: cat.isActive === undefined ? true : !!cat.isActive
      })));

      const sidebarAdsResult = await db.execute("SELECT * FROM sidebarAds");
      setSidebarAds(sidebarAdsResult.rows as unknown as AdConfig[]);

      const topMenuResult = await fetch('/api/admin/top-menu');
      const topMenuData = await topMenuResult.json();
      setTopMenuLinks(topMenuData);

      const menusResult = await fetch('/api/admin/menus');
      const menusData = await menusResult.json();
      setMenus(menusData);

      const companiesResult = await fetch('/api/admin/companies');
      const companiesData = await companiesResult.json();
      setAdminCompanies(companiesData);

      const adsResult = await db.execute("SELECT * FROM ads");
      if (adsResult && adsResult.rows) {
        adsResult.rows.forEach((row: any) => {
          if (row.id === 'home') setHomeAd(row);
          if (row.id === 'home_top') setHomeTopAd(row);
          if (row.id === 'detail') setDetailAd(row);
        });
      }

      if (admin.role === 'superadmin') {
        const usersRes = await fetch('/api/admin/users');
        if (usersRes.ok) setAdminUsers(await usersRes.json());
      }
      
      await fetchConfig();
      if (refreshData) await refreshData();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const siteResult = await db.execute("SELECT * FROM config WHERE id = 'site'");
      if (siteResult.rows.length > 0) {
        const data = siteResult.rows[0];
        setLogoUrl(data.logoUrl as string || '');
        setSiteName(data.siteName as string || 'DİNÇ SIHHİ TESİSAT');
        setSiteTitle(data.siteTitle as string || '');
        setSiteDescription(data.siteDescription as string || '');
        setSiteKeywords(data.siteKeywords as string || '');
        setFooterText(data.footerText as string || '© 2026 DİNÇ SIHHİ TESİSAT. Tüm hakları saklıdır.');
        setServiceCity(data.serviceCity as string || 'mersin');
        setPharmacyCity(data.pharmacyCity as string || 'mersin');
        setPharmacyDistrict(data.pharmacyDistrict as string || '');
        setWeatherCity(data.weatherCity as string || 'mersin');
        setWeatherDistrict(data.weatherDistrict as string || '');
        setTrafficCity(data.trafficCity as string || 'mersin');
        setTrafficDistrict(data.trafficDistrict as string || '');
        setPrayerCity(data.prayerCity as string || 'mersin');
        setPrayerDistrict(data.prayerDistrict as string || '');
      }

      const adsResult = await db.execute("SELECT * FROM ads");
      if (adsResult && adsResult.rows) {
        adsResult.rows.forEach((row: any) => {
          if (row.id === 'home') setHomeAd(row);
          if (row.id === 'home_top') setHomeTopAd(row);
          if (row.id === 'detail') setDetailAd(row);
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [admin]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const seedData = async () => {
    if (!window.confirm('Örnek haberleri yüklemek istiyor musunuz? Bu işlem mevcut haberlerin üzerine ekleme yapacaktır.')) return;
    
    const mockNews = [
      { category: 'SİYASET', title: 'AK Parti’nin 24. Yılı: İshak Şan’dan ‘Milletimize Olan Minnetle Kutluyoruz’ Mesajı', summary: 'AK Parti Adıyaman Milletvekili İshak Şan, partinin 24. kuruluş yıl dönümü dolayısıyla bir mesaj yayımladı.', content: '<p>AK Parti Adıyaman Milletvekili İshak Şan, partinin 24. kuruluş yıl dönümü dolayısıyla bir mesaj yayımladı. Şan mesajında, "Milletimize olan minnetle kutluyoruz" dedi.</p>', imageUrl: 'https://picsum.photos/seed/f1/800/400', isActive: true, displayOptions: { isSlider: true, isFeatured: false, isCategory: true, isSidebar: false } },
      { category: 'SİYASET', title: 'AK Parti’nin 24. Yılı: Resul Kurt’tan Birlik Ve Hizmet Mesajı', summary: 'AK Parti Adıyaman Milletvekili Resul Kurt, partinin 24. kuruluş yıl dönümü dolayısıyla bir mesaj yayımladı.', content: '<p>AK Parti Adıyaman Milletvekili Resul Kurt, partinin 24. kuruluş yıl dönümü dolayısıyla bir mesaj yayımladı. Kurt mesajında birlik ve hizmet vurgusu yaptı.</p>', imageUrl: 'https://picsum.photos/seed/f2/800/400', isActive: true, displayOptions: { isSlider: false, isFeatured: true, isCategory: true, isSidebar: true } },
      { category: 'GÜNCEL', title: 'Genç Nesiller Derneği, Eskişehir’de Şubeleşti', summary: 'Genç Nesiller Derneği, Eskişehir şubesini törenle açtı.', content: '<p>Genç Nesiller Derneği, Eskişehir şubesini törenle açtı. Dernek başkanı yaptığı açıklamada Adıyaman’ın ilçelerinde de çalışmaların sürdüğünü belirtti.</p>', imageUrl: 'https://picsum.photos/seed/f3/800/400', isActive: true, displayOptions: { isSlider: false, isFeatured: true, isCategory: true, isSidebar: true } },
      { category: 'EKONOMİ', title: 'Memur-Sen Genel Başkanı Yalçın: ‘Bu Ciddiyetsiz Teklifi Reddediyoruz’', summary: 'Memur-Sen Genel Başkanı Ali Yalçın, hükümetin toplu sözleşme teklifini ciddiyetsiz bularak reddettiklerini açıkladı.', content: '<p>Memur-Sen Genel Başkanı Ali Yalçın, hükümetin toplu sözleşme teklifini ciddiyetsiz bularak reddettiklerini açıkladı.</p>', imageUrl: 'https://picsum.photos/seed/f4/800/400', isActive: true, displayOptions: { isSlider: false, isFeatured: true, isCategory: true, isSidebar: false } },
    ];

    try {
      for (const news of mockNews) {
        await db.execute({
          sql: "INSERT INTO articles (id, title, summary, content, author, category, createdAt, imageUrl, isActive, displayOptions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          args: [crypto.randomUUID(), news.title, news.summary, news.content, 'Admin', news.category, new Date().toISOString(), news.imageUrl, news.isActive ? 1 : 0, JSON.stringify(news.displayOptions)]
        });
      }
      alert('Örnek haberler başarıyla yüklendi!');
      clearCache('articles');
      fetchData();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!filePath) return;
    
    // If it's a Firebase Storage URL
    if (filePath.includes('firebasestorage.googleapis.com')) {
      try {
        // We don't necessarily need to delete from Firebase Storage in this simple implementation
        // but we could if we wanted to. For now, just logging.
        console.log('Firebase file deletion requested for:', filePath);
      } catch (error) {
        console.error('Error deleting Firebase file:', error);
      }
      return;
    }

    // Legacy local file deletion
    if (filePath.startsWith('/uploads/')) {
      try {
        await fetch('/api/delete-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath })
        });
      } catch (error) {
        console.error('Error deleting local file:', error);
      }
    }
  };

  const uploadWithProgress = (file: File, onProgress: (percent: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch (e) {
            reject(new Error('Geçersiz sunucu yanıtı'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || 'Yükleme başarısız oldu'));
          } catch (e) {
            reject(new Error(`Yükleme hatası: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Ağ hatası oluştu'));
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    // 10MB limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Dosya boyutu çok büyük (Maksimum 10MB)');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Sadece jpg, jpeg, png, webp ve gif formatları kabul edilir!');
    }

    try {
      setUploadProgress(0);
      const url = await uploadWithProgress(file, (percent) => {
        setUploadProgress(percent);
      });
      return url;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error('Yükleme hatası: ' + error.message);
    }
  };

  const uploadAdFile = async (file: File, target: string): Promise<string> => {
    // 5MB limit for ads
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Dosya boyutu çok büyük (Maksimum 5MB)');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Sadece jpg, jpeg, png, webp ve gif formatları kabul edilir!');
    }

    try {
      setAdUploadProgress(prev => ({ ...prev, [target]: 0 }));
      const url = await uploadWithProgress(file, (percent) => {
        setAdUploadProgress(prev => ({ ...prev, [target]: percent }));
      });
      return url;
    } catch (error: any) {
      console.error('Ad upload error:', error);
      throw new Error('Reklam yükleme hatası: ' + error.message);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploadingImage(true);
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const url = await uploadFile(file);
          await db.execute({
            sql: "INSERT INTO gallery (id, url, createdAt, caption) VALUES (?, ?, ?, ?)",
            args: [crypto.randomUUID(), url, new Date().toISOString(), '']
          });
        }
        showSuccess('Görseller başarıyla yüklendi!');
        clearCache('gallery');
        fetchData();
      } catch (error) {
        console.error('Gallery upload error:', error);
        alert('Yükleme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    }
  };

  const deleteGalleryImage = async (id: string) => {
    if (window.confirm('Bu fotoğrafı galeriden silmek istediğinize emin misiniz?')) {
      try {
        const result = await db.execute({
          sql: "SELECT url FROM gallery WHERE id = ?",
          args: [id]
        });
        if (result.rows.length > 0) {
          const url = (result.rows[0] as any).url;
          await deleteFile(url);
        }

        await db.execute({
          sql: "DELETE FROM gallery WHERE id = ?",
          args: [id]
        });
        showSuccess('Fotoğraf silindi!');
        clearCache('gallery');
        fetchData();
      } catch (error) {
        console.error('Error deleting gallery image:', error);
        alert('Fotoğraf silinirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingArticleId) {
        console.log('Updating article', editingArticleId, 'with image:', imageUrl);
        
        // If image changed, delete the old one
        if (originalImageUrl && imageUrl !== originalImageUrl) {
          await deleteFile(originalImageUrl);
        }

        await db.execute({
          sql: "UPDATE articles SET title = ?, summary = ?, content = ?, category = ?, imageUrl = ?, isActive = ?, displayOptions = ?, gallery = ?, tags = ? WHERE id = ?",
          args: [title, summary, content, category, imageUrl, isActive ? 1 : 0, JSON.stringify(displayOptions), JSON.stringify(articleGallery), tags, editingArticleId]
        });
        setEditingArticleId(null);
        setOriginalImageUrl(null);
        showSuccess('Haber güncellendi!');
      } else {
        console.log('Creating new article with image:', imageUrl);
        await db.execute({
          sql: "INSERT INTO articles (id, title, summary, content, author, category, createdAt, imageUrl, isActive, displayOptions, gallery, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          args: [crypto.randomUUID(), title, summary, content, 'Admin', category, new Date().toISOString(), imageUrl, isActive ? 1 : 0, JSON.stringify(displayOptions), JSON.stringify(articleGallery), tags]
        });
        showSuccess('Haber başarıyla eklendi!');
      }
      setTitle('');
      setSummary('');
      setContent('');
      setImageUrl('');
      setTags('');
      setArticleGallery([]);
      clearCache('articles');
      fetchData();
    } catch (error) {
      console.error('Error submitting article:', error);
      alert('Haber eklenirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const startEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setTitle(article.title);
    setSummary(article.summary);
    setContent(article.content);
    setImageUrl(article.imageUrl);
    setOriginalImageUrl(article.imageUrl);
    setCategory(article.category);
    setTags(article.tags || '');
    setIsActive(article.isActive);
    setDisplayOptions({
      isSlider: false,
      isFeatured: false,
      isCategory: true,
      isSidebar: false,
      isBreaking: false,
      ...article.displayOptions
    });
    setArticleGallery(article.gallery || []);
  };

  const handleArticleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        // If we already uploaded a new image in this session (but haven't saved yet),
        // delete it before uploading another one to avoid orphans.
        if (imageUrl && imageUrl !== originalImageUrl && imageUrl.startsWith('/uploads/')) {
          await deleteFile(imageUrl);
        }

        const url = await uploadFile(file);
        setImageUrl(url);
        // Reset input value so the same file can be selected again
        e.target.value = '';
      } catch (error) {
        console.error('Article image upload error:', error);
        alert('Yükleme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleArticleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploadingImage(true);
      try {
        const newImages = [];
        for (let i = 0; i < files.length; i++) {
          try {
            const url = await uploadFile(files[i]);
            newImages.push(url);
          } catch (error) {
            console.error('Gallery item upload error:', error);
          }
        }
        setArticleGallery(prev => [...prev, ...newImages]);
      } catch (error) {
        console.error('Article gallery upload error:', error);
        alert('Yükleme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    }
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        setIsUploadingImage(true);
        try {
          const url = await uploadFile(file);
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            if (range) {
              quill.insertEmbed(range.index, 'image', url);
            }
          }
        } catch (error) {
          console.error('Editor image upload error:', error);
          alert('Görsel yüklenirken hata oluştu.');
        } finally {
          setIsUploadingImage(false);
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      console.log('Saving config...', { siteName, logoUrlLength: logoUrl?.length });
      await db.execute({
        sql: `INSERT OR REPLACE INTO config (
          id, logoUrl, siteName, siteTitle, siteDescription, siteKeywords, footerText, serviceCity,
          pharmacyCity, pharmacyDistrict, weatherCity, weatherDistrict, trafficCity, trafficDistrict, prayerCity, prayerDistrict
        ) VALUES ('site', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          logoUrl || '', siteName, siteTitle, siteDescription, siteKeywords, footerText, serviceCity,
          pharmacyCity, pharmacyDistrict, weatherCity, weatherDistrict, trafficCity, trafficDistrict, prayerCity, prayerDistrict
        ]
      });
      showSuccess('Site ayarları başarıyla güncellendi!');
      await fetchConfig();
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Ayarlar güncellenirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAds(true);
    try {
      console.log('Saving ads...', { homeAd, homeTopAd, detailAd });
      
      await db.execute({
        sql: "INSERT OR REPLACE INTO ads (id, type, imageUrl, adCode, link) VALUES ('home', ?, ?, ?, ?)",
        args: [homeAd.type || 'image', homeAd.imageUrl || '', homeAd.adCode || '', homeAd.link || '']
      });
      await db.execute({
        sql: "INSERT OR REPLACE INTO ads (id, type, imageUrl, adCode, link) VALUES ('home_top', ?, ?, ?, ?)",
        args: [homeTopAd.type || 'image', homeTopAd.imageUrl || '', homeTopAd.adCode || '', homeTopAd.link || '']
      });
      await db.execute({
        sql: "INSERT OR REPLACE INTO ads (id, type, imageUrl, adCode, link) VALUES ('detail', ?, ?, ?, ?)",
        args: [detailAd.type || 'image', detailAd.imageUrl || '', detailAd.adCode || '', detailAd.link || '']
      });
      
      // Clear all possible ad cache keys
      clearCache('home_ad');
      clearCache('detail_ad');
      localStorage.removeItem('home_ad');
      localStorage.removeItem('detail_ad');
      
      showSuccess('Reklam ayarları başarıyla güncellendi!');
      await fetchConfig();
      if (refreshData) await refreshData();
    } catch (error) {
      console.error('Error updating ads:', error);
      alert('Reklamlar güncellenirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSavingAds(false);
    }
  };

  const handleSidebarAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.execute({
        sql: "INSERT INTO sidebarAds (id, type, imageUrl, adCode, link) VALUES (?, ?, ?, ?, ?)",
        args: [crypto.randomUUID(), newSidebarAd.type, newSidebarAd.imageUrl, newSidebarAd.adCode, newSidebarAd.link]
      });
      setNewSidebarAd({ type: 'image', imageUrl: '', adCode: '', link: '' });
      showSuccess('Sidebar reklamı eklendi!');
      clearCache('sidebarAds');
      fetchData();
    } catch (error) {
      console.error('Error adding sidebar ad:', error);
    }
  };

  const handleSidebarAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const url = await uploadFile(file);
        setNewSidebarAd({...newSidebarAd, imageUrl: url});
        showSuccess('Görsel yüklendi!');
      } catch (error) {
        console.error('Sidebar ad upload error:', error);
        alert('Yükleme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const deleteSidebarAd = async (id: string) => {
    try {
      const result = await db.execute({
        sql: "SELECT imageUrl FROM sidebarAds WHERE id = ?",
        args: [id]
      });
      if (result.rows.length > 0) {
        const url = (result.rows[0] as any).imageUrl;
        await deleteFile(url);
      }

      await db.execute({
        sql: "DELETE FROM sidebarAds WHERE id = ?",
        args: [id]
      });
      showSuccess('Reklam başarıyla silindi!');
      clearCache('sidebarAds');
      fetchData();
    } catch (error) {
      console.error('Error deleting sidebar ad:', error);
      alert('Reklam silinirken bir hata oluştu.');
    }
  };

  const deleteArticle = async (id: string) => {
    if (window.confirm('Bu haberi silmek istediğinize emin misiniz?')) {
      try {
        const result = await db.execute({
          sql: "SELECT imageUrl FROM articles WHERE id = ?",
          args: [id]
        });
        if (result.rows.length > 0) {
          const url = (result.rows[0] as any).imageUrl;
          await deleteFile(url);
        }

        await db.execute({
          sql: "DELETE FROM articles WHERE id = ?",
          args: [id]
        });
        showSuccess('Haber silindi!');
        clearCache('articles');
        fetchData();
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Haber silinirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    }
  };

  const toggleArticleStatus = async (article: Article) => {
    try {
      await db.execute({
        sql: "UPDATE articles SET isActive = ? WHERE id = ?",
        args: [!article.isActive ? 1 : 0, article.id]
      });
      showSuccess(`Haber ${!article.isActive ? 'aktif' : 'pasif'} yapıldı!`);
      clearCache('articles');
      fetchData();
    } catch (error) {
      console.error('Error toggling article status:', error);
      alert('Haber durumu değiştirilirken bir hata oluştu.');
    }
  };

  const startEditTopMenu = (link: TopMenuLink) => {
    setEditingTopMenuId(link.id);
    setNewTopMenuLink({
      title: link.title,
      url: link.url,
      icon: link.icon,
      orderIndex: link.orderIndex,
      position: link.position
    });
  };

  const handleTopMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTopMenuId) {
        const response = await fetch(`/api/admin/top-menu/${editingTopMenuId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTopMenuLink)
        });
        if (!response.ok) throw new Error('Güncelleme başarısız');
        showSuccess('Menü linki güncellendi!');
      } else {
        const response = await fetch('/api/admin/top-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTopMenuLink)
        });
        if (!response.ok) throw new Error('Ekleme başarısız');
        showSuccess('Menü linki eklendi!');
      }
      setEditingTopMenuId(null);
      setNewTopMenuLink({ title: '', url: '', icon: '', orderIndex: 0, position: 'right' });
      fetchData();
    } catch (error) {
      console.error('Error saving top menu link:', error);
      alert('Hata: ' + error);
    }
  };

  const deleteTopMenuLink = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/top-menu/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Silme işlemi başarısız');
      showSuccess('Link silindi!');
      setDeletingTopMenuId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting top menu link:', error);
      alert('Hata: Link silinemedi.');
    }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenuId) {
        await fetch(`/api/admin/menus/${editingMenuId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMenu)
        });
        showSuccess('Menü güncellendi!');
      } else {
        await fetch('/api/admin/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMenu)
        });
        showSuccess('Menü eklendi!');
      }
      setEditingMenuId(null);
      setNewMenu({ title: '', url: '', order: 0, is_active: true, parent_id: null });
      fetchData();
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const startEditMenu = (menu: Menu) => {
    setEditingMenuId(menu.id);
    setNewMenu({
      title: menu.title,
      url: menu.url,
      order: menu.order,
      is_active: !!menu.is_active,
      parent_id: menu.parent_id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteMenu = async (id: string) => {
    try {
      await fetch(`/api/admin/menus/${id}`, { method: 'DELETE' });
      showSuccess('Menü silindi!');
      setDeletingMenuId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Hata: Menü silinemedi.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordChange)
      });
      if (response.ok) {
        showSuccess('Şifre başarıyla değiştirildi!');
        setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        alert('Hata: ' + data.error);
      }
    } catch (err) {
      alert('Şifre değiştirilemedi');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminUser)
      });
      if (response.ok) {
        showSuccess('Yeni yönetici eklendi!');
        setNewAdminUser({ username: '', password: '', role: 'admin' });
        fetchData();
      } else {
        const data = await response.json();
        alert('Hata: ' + data.error);
      }
    } catch (err) {
      alert('Yönetici eklenemedi');
    }
  };

  const deleteAdmin = async (id: string) => {
    if (window.confirm('Bu yöneticiyi silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
          showSuccess('Yönetici silindi!');
          fetchData();
        } else {
          const data = await response.json();
          alert('Hata: ' + data.error);
        }
      } catch (err) {
        alert('Yönetici silinemedi');
      }
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (!admin) {
    return <Login onLogin={(adminData) => {
      setAdmin(adminData);
      fetchData();
    }} />;
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    console.log('Submitting category. Editing ID:', editingCategoryId);
    
    try {
      if (editingCategoryId) {
        console.log('Performing UPDATE for category:', editingCategoryId);
        
        // Cascade update for articles if name changed
        const oldCategory = categories.find(c => c.id === editingCategoryId);
        if (oldCategory && oldCategory.name !== newCategory.name) {
          console.log(`Renaming category in articles from "${oldCategory.name}" to "${newCategory.name}"`);
          await db.execute({
            sql: "UPDATE articles SET category = ? WHERE category = ?",
            args: [newCategory.name, oldCategory.name]
          });
        }

        await db.execute({
          sql: "UPDATE categories SET name = ?, showInMenu = ?, showOnHomepage = ?, color = ?, isActive = ? WHERE id = ?",
          args: [newCategory.name, newCategory.showInMenu ? 1 : 0, newCategory.showOnHomepage ? 1 : 0, newCategory.color, newCategory.isActive ? 1 : 0, editingCategoryId]
        });
        setEditingCategoryId(null);
        showSuccess('Kategori başarıyla güncellendi!');
      } else {
        console.log('Performing INSERT for new category');
        await db.execute({
          sql: "INSERT INTO categories (id, name, showInMenu, showOnHomepage, color, isActive) VALUES (?, ?, ?, ?, ?, ?)",
          args: [crypto.randomUUID(), newCategory.name, newCategory.showInMenu ? 1 : 0, newCategory.showOnHomepage ? 1 : 0, newCategory.color, newCategory.isActive ? 1 : 0]
        });
        showSuccess('Kategori başarıyla eklendi!');
      }
      setNewCategory({ name: '', showInMenu: true, showOnHomepage: false, color: '#e60026', isActive: true });
      clearCache('categories');
      await fetchData();
    } catch (error) {
      console.error('Error submitting category:', error);
      alert('Kategori işlemi sırasında bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryStatus = async (cat: any) => {
    try {
      const newStatus = !cat.isActive;
      await db.execute({
        sql: "UPDATE categories SET isActive = ? WHERE id = ?",
        args: [newStatus ? 1 : 0, cat.id]
      });
      showSuccess(`Kategori ${newStatus ? 'aktif' : 'pasif'} yapıldı!`);
      clearCache('categories');
      fetchData();
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Durum değiştirilirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const startEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setNewCategory({ 
      name: cat.name, 
      showInMenu: cat.showInMenu, 
      showOnHomepage: cat.showOnHomepage || false, 
      color: cat.color,
      isActive: cat.isActive
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCategory = async (id: string) => {
    if (!id) return;
    try {
      console.log('Deleting category with ID:', id);
      await db.execute({
        sql: "DELETE FROM categories WHERE id = ?",
        args: [id]
      });
      showSuccess('Kategori başarıyla silindi!');
      setDeleteConfirmId(null);
      clearCache('categories');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        if (logoUrl && logoUrl.startsWith('/uploads/')) {
          await deleteFile(logoUrl);
        }
        const url = await uploadFile(file);
        setLogoUrl(url);
        showSuccess('Logo yüklendi, kaydetmeyi unutmayın!');
      } catch (error) {
        console.error('Logo upload error:', error);
        alert('Yükleme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleLogoDelete = async () => {
    if (!window.confirm('Logo görselini silmek istediğinizden emin misiniz?')) return;
    setLogoUrl('');
    showSuccess('Logo silindi! Kaydetmeyi unutmayın.');
  };

  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'home' | 'home_top' | 'detail') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAd(target);
      try {
        const url = await uploadAdFile(file, target);
        if (target === 'home') setHomeAd({ ...homeAd, imageUrl: url, type: 'image' });
        else if (target === 'home_top') setHomeTopAd({ ...homeTopAd, imageUrl: url, type: 'image' });
        else setDetailAd({ ...detailAd, imageUrl: url, type: 'image' });
        showSuccess('Görsel yüklendi! Kaydetmeyi unutmayın.');
      } catch (error) {
        console.error('Ad upload error:', error);
        alert('Yükleme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      } finally {
        setIsUploadingAd(null);
      }
    }
  };

  const handleAdImageDelete = async (target: 'home' | 'home_top' | 'detail') => {
    if (!window.confirm('Bu reklam görselini silmek istediğinizden emin misiniz?')) return;
    
    try {
      if (target === 'home') setHomeAd({ ...homeAd, imageUrl: '' });
      else if (target === 'home_top') setHomeTopAd({ ...homeTopAd, imageUrl: '' });
      else setDetailAd({ ...detailAd, imageUrl: '' });
      
      showSuccess('Görsel silindi! Kaydetmeyi unutmayın.');
    } catch (error) {
      console.error('Ad image delete error:', error);
      alert('Silme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  const handleSidebarAdImageDelete = async () => {
    if (!window.confirm('Bu reklam görselini silmek istediğinizden emin misiniz?')) return;
    setNewSidebarAd({ ...newSidebarAd, imageUrl: '' });
    showSuccess('Görsel silindi!');
  };

  const fixAdsTable = async () => {
    if (!window.confirm('Reklam tablosu sıfırlanacak ve varsayılan değerler yüklenecek. Emin misiniz?')) return;
    setIsFixingAds(true);
    try {
      await db.execute("DROP TABLE IF EXISTS ads");
      await db.execute("CREATE TABLE ads (id TEXT PRIMARY KEY, type TEXT, imageUrl TEXT, adCode TEXT, link TEXT)");
      await db.execute("INSERT INTO ads (id, type, imageUrl, adCode, link) VALUES ('home', 'image', '', '', '')");
      await db.execute("INSERT INTO ads (id, type, imageUrl, adCode, link) VALUES ('home_top', 'image', '', '', '')");
      await db.execute("INSERT INTO ads (id, type, imageUrl, adCode, link) VALUES ('detail', 'image', '', '', '')");
      
      clearCache('home_ad');
      clearCache('detail_ad');
      showSuccess('Reklam tablosu başarıyla onarıldı!');
      fetchData();
    } catch (error) {
      console.error('Error fixing ads table:', error);
      alert('Hata: ' + error);
    } finally {
      setIsFixingAds(false);
    }
  };

  const saveAdSlot = async (id: 'home' | 'home_top' | 'detail', config: AdConfig) => {
    setIsSavingAds(true);
    try {
      await db.execute({
        sql: "INSERT OR REPLACE INTO ads (id, type, imageUrl, adCode, link) VALUES (?, ?, ?, ?, ?)",
        args: [id, config.type || 'image', config.imageUrl || '', config.adCode || '', config.link || '']
      });
      
      clearCache('home_ad');
      clearCache('detail_ad');
      showSuccess('Reklam başarıyla kaydedildi!');
      if (refreshData) await refreshData();
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('Hata: ' + error);
    } finally {
      setIsSavingAds(false);
    }
  };

  const handleCompanyStatusToggle = async (company: any) => {
    try {
      const response = await fetch(`/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !company.isApproved ? 1 : 0 })
      });
      const result = await response.json();
      if (result.success) {
        showSuccess(`Firma ${!company.isApproved ? 'onaylandı' : 'onayı kaldırıldı'}!`);
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling company status:', error);
    }
  };

  const deleteCompany = async (id: string) => {
    if (window.confirm('Bu firmayı silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/companies/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          showSuccess('Firma silindi!');
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const startEditCompany = (company: any) => {
    setEditingCompanyId(company.id);
    setCompanyFormData({
      name: company.name,
      category: company.category,
      authorizedPerson: company.authorizedPerson,
      phone: company.phone,
      whatsapp: company.whatsapp,
      address: company.address,
      district: company.district,
      website: company.website,
      description: company.description,
      isApproved: company.isApproved
    });
    setCompanyLogoPreview(company.logo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      const data = new FormData();
      Object.entries(companyFormData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      if (companyLogo) {
        data.append('logo', companyLogo);
      }

      const response = await fetch(`/api/admin/companies/${editingCompanyId}`, {
        method: 'PUT',
        body: data
      });

      const result = await response.json();
      if (result.success) {
        showSuccess('Firma güncellendi!');
        setEditingCompanyId(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (!admin) {
    return <Login onLogin={(adminData) => {
      setAdmin(adminData);
      fetchData();
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {successMessage && (
        <div className="fixed top-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-sm shadow-2xl z-[100] font-bold flex items-center gap-3 border border-gray-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {successMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full p-8 rounded-sm shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-center text-gray-900 mb-2">Kategoriyi Sil</h3>
            <p className="text-gray-500 text-center mb-8 font-medium">Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-sm font-bold hover:bg-gray-200 transition-all"
              >
                İptal
              </button>
              <button 
                onClick={() => deleteCategory(deleteConfirmId)}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                Evet, Sil
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-72 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-[70] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-sm flex items-center justify-center shadow-lg shadow-red-200">
                <ShieldAlert className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-gray-900 leading-none">HABER</h1>
                <p className="text-[10px] font-bold text-red-600 tracking-[0.2em] mt-1 uppercase">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1.5">
              {[
                { id: 'dashboard', label: 'Anasayfa', icon: Home },
                { id: 'articles', label: 'Haberler', icon: FileText },
                { id: 'categories', label: 'Kategoriler', icon: List },
                { id: 'top-menu', label: 'Üst Menü', icon: Menu },
                { id: 'menus', label: 'Ana Menü', icon: Layout },
                { id: 'ads', label: 'Reklamlar', icon: Megaphone },
                { id: 'gallery', label: 'Galeri', icon: ImageIcon },
                { id: 'companies', label: 'Firmalar', icon: Building2 },
                { id: 'service-settings', label: 'Servis Ayarları', icon: Activity },
                { id: 'users', label: 'Yöneticiler', icon: User },
                { id: 'settings', label: 'Ayarlar', icon: Settings },
              ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-sm font-bold transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-red-50 text-red-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-red-600' : 'text-gray-400'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 px-5 py-3.5 rounded-sm text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Çıkış Yap
          </button>
          <Link to="/" className="w-full bg-white border border-gray-200 text-gray-600 px-5 py-3.5 rounded-sm text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <Globe size={18} /> Siteye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-sm">
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-sm border border-gray-100 w-64 md:w-96">
              <Search className="text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Haber ara..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-full text-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-gray-100"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900">{admin.username}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{admin.role === 'superadmin' ? 'Süper Yönetici' : 'Yönetici'}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center text-gray-600 font-bold border border-gray-200 uppercase">
                {admin.username?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Yönetici Ayarları</h2>
                <p className="text-gray-500 mt-1 font-medium">Şifrenizi değiştirin veya yeni yöneticiler ekleyin.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <div className="w-8 h-8 bg-red-50 text-red-600 rounded-sm flex items-center justify-center">
                    <ShieldAlert size={18} />
                  </div>
                  Şifre Değiştir
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mevcut Şifre</label>
                    <input 
                      type="password" 
                      value={passwordChange.currentPassword}
                      onChange={(e) => setPasswordChange({...passwordChange, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Yeni Şifre</label>
                    <input 
                      type="password" 
                      value={passwordChange.newPassword}
                      onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Yeni Şifre (Tekrar)</label>
                    <input 
                      type="password" 
                      value={passwordChange.confirmPassword}
                      onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                    ŞİFREYİ GÜNCELLE
                  </button>
                </form>
              </div>

              {admin.role === 'superadmin' && (
                <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded-sm flex items-center justify-center">
                      <User size={18} />
                    </div>
                    Yeni Yönetici Ekle
                  </h3>
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kullanıcı Adı</label>
                      <input 
                        type="text" 
                        value={newAdminUser.username}
                        onChange={(e) => setNewAdminUser({...newAdminUser, username: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Şifre</label>
                      <input 
                        type="password" 
                        value={newAdminUser.password}
                        onChange={(e) => setNewAdminUser({...newAdminUser, password: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Yetki</label>
                      <select 
                        value={newAdminUser.role}
                        onChange={(e) => setNewAdminUser({...newAdminUser, role: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold"
                      >
                        <option value="admin">Yönetici</option>
                        <option value="superadmin">Süper Yönetici</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-sm font-black uppercase tracking-widest hover:bg-black transition-all">
                      YÖNETİCİ EKLE
                    </button>
                  </form>
                </div>
              )}
            </div>

            {admin.role === 'superadmin' && (
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-black text-gray-900 uppercase tracking-widest">Mevcut Yöneticiler</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kullanıcı Adı</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Yetki</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kayıt Tarihi</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {adminUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{user.username}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              {user.role === 'superadmin' ? 'Süper Yönetici' : 'Yönetici'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-400">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                          <td className="px-6 py-4 text-right">
                            {user.id !== admin.id && (
                              <button onClick={() => deleteAdmin(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all">
                                <Trash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Hoş Geldiniz, {admin.username}</h2>
                <p className="text-gray-500 mt-1 font-medium">Sitenizin bugünkü performansına ve genel durumuna göz atın.</p>
              </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white px-4 py-2 rounded-sm border border-gray-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Sistem Aktif</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Toplam Haber', value: articles.length, icon: FileText, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
                      { label: 'Kategoriler', value: categories.length, icon: List, color: 'bg-purple-50 text-purple-600', trend: 'Sabit' },
                      { label: 'Galeri Görseli', value: galleryImages.length, icon: ImageIcon, color: 'bg-orange-50 text-orange-600', trend: '+5' },
                      { label: 'Aktif Reklam', value: sidebarAds.length + 2, icon: Megaphone, color: 'bg-red-50 text-red-600', trend: 'Aktif' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className={`w-14 h-14 ${stat.color} rounded-sm flex items-center justify-center`}>
                          <stat.icon size={28} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                          <div className="flex items-end gap-2">
                            <h4 className="text-2xl font-black text-gray-900 leading-none mt-1">{stat.value}</h4>
                            <span className="text-[10px] font-bold text-green-500 mb-0.5">{stat.trend}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-sm shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900">Son Eklenen Haberler</h3>
                        <button onClick={() => setActiveTab('articles')} className="text-red-600 text-sm font-bold hover:underline">Tümünü Gör</button>
                      </div>
                      <div className="space-y-4">
                        {articles.slice(0, 5).map((article) => (
                          <div key={article.id} className="flex items-center gap-4 p-4 rounded-sm hover:bg-gray-50 transition-colors group">
                            <div className="w-16 h-12 rounded-sm overflow-hidden flex-shrink-0">
                              {article.imageUrl ? (
                                <img src={normalizeImageUrl(article.imageUrl)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                  <ImageIcon size={20} />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">{article.title}</h4>
                              <p className="text-xs text-gray-400 font-medium">{new Date(article.createdAt).toLocaleDateString('tr-TR')} • {article.category}</p>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-red-600 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-gray-900 p-8 rounded-sm shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h3 className="text-xl font-black mb-2 relative z-10">Hızlı İstatistik</h3>
                        <p className="text-gray-400 text-sm mb-6 relative z-10">Sitenizdeki içerik dağılımı ve aktiflik durumu.</p>
                        
                        <div className="space-y-6 relative z-10">
                          <div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                              <span>Aktif Haberler</span>
                              <span>{articles.length > 0 ? Math.round((articles.filter(a => a.isActive).length / articles.length) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-600 rounded-full" 
                                style={{ width: `${articles.length > 0 ? (articles.filter(a => a.isActive).length / articles.length) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                              <span>Kategori Doluluğu</span>
                              <span>75%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 sm:p-8 rounded-sm shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Sistem Durumu</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-bold text-gray-600">Veritabanı Bağlantısı</span>
                            <span className="ml-auto text-[10px] font-black text-green-500 uppercase">Stabil</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-bold text-gray-600">Depolama Alanı</span>
                            <span className="ml-auto text-[10px] font-black text-green-500 uppercase">92% Boş</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-bold text-gray-600">Önbellek Durumu</span>
                            <span className="ml-auto text-[10px] font-black text-orange-500 uppercase">Yenileniyor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'articles' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Haber Yönetimi</h2>
              <p className="text-gray-500 mt-1 font-medium">Tüm haberleri buradan yönetebilir, yeni haber ekleyebilirsiniz.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-sm border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Toplam Haber</p>
                  <p className="text-lg font-black text-gray-900 leading-none mt-1">{articles.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-sm flex items-center justify-center text-blue-600">
                  <FileText size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Add/Edit Form */}
            <div>
              <div className="bg-white p-4 sm:p-8 rounded-sm shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-50 rounded-sm flex items-center justify-center">
                    <Plus size={18} className="text-red-600" />
                  </div>
                  {editingArticleId ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
                </h3>
                
                <form onSubmit={handleArticleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Haber Başlığı</label>
                        <input 
                          type="text" 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)} 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                          placeholder="Haber başlığını girin..."
                          required 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori</label>
                          <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium appearance-none"
                          >
                            {categories.map((cat, index) => (
                              <option key={cat.id ? `cat-opt-${cat.id}` : `cat-opt-idx-${index}`} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ana Fotoğraf</label>
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleArticleImageUpload}
                              disabled={isUploadingImage}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                            />
                            <div className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-100 transition-colors ${isUploadingImage ? 'opacity-50' : ''}`}>
                              {isUploadingImage ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                              ) : (
                                <ImageIcon size={18} />
                              )}
                              {isUploadingImage ? (
                                <div className="flex items-center gap-2">
                                  <span>{`Yükleniyor... %${uploadProgress}`}</span>
                                </div>
                              ) : (imageUrl ? 'Değiştir' : 'Yükle')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Haber Galerisi (Ek Fotoğraflar)</label>
                        <div className="relative mb-4">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            onChange={handleArticleGalleryUpload}
                            disabled={isUploadingImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                          />
                          <div className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-100 transition-colors ${isUploadingImage ? 'opacity-50' : ''}`}>
                            {isUploadingImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <Plus size={18} />
                            )}
                            {isUploadingImage ? (
                              <div className="flex items-center gap-2">
                                <span>{`Yükleniyor... %${uploadProgress}`}</span>
                              </div>
                            ) : 'Fotoğraf Ekle'}
                          </div>
                        </div>
                        
                        {articleGallery.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {articleGallery.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-gray-100 group">
                                {img ? (
                                  <img src={normalizeImageUrl(img)} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                    <ImageIcon size={20} />
                                  </div>
                                )}
                                <button 
                                  type="button"
                                  onClick={() => setArticleGallery(articleGallery.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {imageUrl && (
                        <div className="relative rounded-sm overflow-hidden border border-gray-100 aspect-video">
                          <img src={normalizeImageUrl(imageUrl)} className="w-full h-full object-cover" alt="" />
                          <button 
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-sm text-red-600 hover:bg-white transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kısa Özet</label>
                        <textarea 
                          value={summary} 
                          onChange={(e) => setSummary(e.target.value)} 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium h-[116px] resize-none" 
                          placeholder="Haberin kısa bir özetini yazın..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Haber Etiketleri (SEO)</label>
                        <input 
                          type="text" 
                          value={tags} 
                          onChange={(e) => setTags(e.target.value)} 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                          placeholder="etiket1, etiket2, etiket3..."
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic">Haberin arama motorlarında bulunmasını kolaylaştırır.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Haber İçeriği</label>
                        <div className="bg-gray-50 border border-gray-100 rounded-sm overflow-hidden">
                          <ReactQuillAny 
                            ref={quillRef}
                            theme="snow" 
                            value={content} 
                            onChange={setContent}
                            modules={modules}
                            className="h-[300px] mb-12"
                            placeholder="Haber detaylarını buraya girin..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                      <IOSSwitch 
                        label="Manşet (Slider)" 
                        checked={displayOptions.isSlider} 
                        onChange={(val) => setDisplayOptions({...displayOptions, isSlider: val})} 
                      />
                      <IOSSwitch 
                        label="Öne Çıkanlar" 
                        checked={displayOptions.isFeatured} 
                        onChange={(val) => setDisplayOptions({...displayOptions, isFeatured: val})} 
                      />
                      <IOSSwitch 
                        label="Kategori Haberleri" 
                        checked={displayOptions.isCategory} 
                        onChange={(val) => setDisplayOptions({...displayOptions, isCategory: val})} 
                      />
                      <IOSSwitch 
                        label="Manşet Yanı" 
                        checked={displayOptions.isSidebar} 
                        onChange={(val) => setDisplayOptions({...displayOptions, isSidebar: val})} 
                      />
                      <IOSSwitch 
                        label="Son Dakika" 
                        checked={displayOptions.isBreaking} 
                        onChange={(val) => setDisplayOptions({...displayOptions, isBreaking: val})} 
                      />
                      <IOSSwitch 
                        label="Haberi Aktif Et" 
                        checked={isActive} 
                        onChange={(val) => setIsActive(val)} 
                      />
                    </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          {isUploadingImage ? (
                            <div className="flex-1 bg-red-600/50 text-white py-4 rounded-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed shadow-lg shadow-red-100">
                              <div className="flex items-center gap-2">
                                <span>{`Resim Yükleniyor... %${uploadProgress}`}</span>
                              </div>
                            </div>
                          ) : (
                            <button 
                              type="submit" 
                              disabled={isSaving}
                              className={`flex-1 bg-red-600 text-white py-4 rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                              {isSaving ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              ) : (
                                <Check size={20} />
                              )}
                              {isSaving ? 'Kaydediliyor...' : (editingArticleId ? 'Güncelle' : 'Yayınla')}
                            </button>
                          )}
                          {editingArticleId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingArticleId(null);
                            setTitle('');
                            setSummary('');
                            setContent('');
                            setImageUrl('');
                          }}
                          className="px-6 bg-gray-100 text-gray-600 py-4 rounded-sm font-bold hover:bg-gray-200 transition-all"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-sm border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-sm flex items-center justify-center text-red-600">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-none">Haberleri Filtrele</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Kategoriye göre listele</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold text-sm min-w-[200px]"
                  >
                    <option value="Tümü">Tüm Kategoriler</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {articles
                  .filter(a => filterCategory === 'Tümü' || a.category === filterCategory)
                  .map((article) => (
                    <div 
                      key={`article-card-${article.id}`} 
                      className="bg-white p-3 sm:p-5 rounded-sm shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-5 group hover:border-red-100 transition-all"
                    >
                    <div className="relative w-20 h-16 sm:w-32 sm:h-24 flex-shrink-0 rounded-sm overflow-hidden shadow-sm">
                      {article.imageUrl ? (
                        <img 
                          src={normalizeImageUrl(article.imageUrl)} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          onError={(e) => {
                            // If it's a broken image, we show the placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = "w-full h-full bg-red-50 flex items-center justify-center text-red-300";
                              placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off"><line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 10.41l-4.59 4.59"/><path d="M14.59 14.59l4.59-4.59"/><path d="M3.59 3.59A9 9 0 0 0 3 6v12a3 3 0 0 0 3 3h12a9 9 0 0 0 2.41-.59"/><path d="M9 9a3 3 0 1 0 3 3"/><path d="M17.8 12.2a3 3 0 0 0-3.6-3.6"/></svg>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider ${article.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {article.isActive ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-sm">{article.category}</span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(article.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-red-600 transition-colors">{article.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        {article.displayOptions?.isSlider && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Manşet
                          </div>
                        )}
                        {article.displayOptions?.isFeatured && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Öne Çıkan
                          </div>
                        )}
                        {article.displayOptions?.isSidebar && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Yan Panel
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pr-2">
                      <IOSSwitch 
                        checked={article.isActive} 
                        onChange={() => toggleArticleStatus(article)} 
                      />
                      <div className="h-8 w-[1px] bg-gray-50 mx-2"></div>
                      <button 
                        onClick={() => startEditArticle(article)}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                        title="Düzenle"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button 
                        onClick={() => deleteArticle(article.id)}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                        title="Sil"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {articles.length === 0 && (
                  <div className="text-center py-24 bg-white rounded-sm border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-500 font-bold">Henüz haber eklenmemiş.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Reklam Yönetimi</h2>
              <p className="text-gray-500 mt-1 font-medium">Site genelindeki reklam alanlarını ve içeriklerini profesyonelce yönetin.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={fixAdsTable}
                disabled={isFixingAds}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isFixingAds ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />} 
                Tabloyu Onar
              </button>
              <button 
                onClick={handleAdsSubmit}
                disabled={isSavingAds}
                className="px-8 py-3 bg-red-600 text-white rounded-sm font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingAds ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} 
                {isSavingAds ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Ad Slots List */}
            <div className="space-y-8">
              {[
                { id: 'home_top', title: 'Anasayfa Üst Reklamı', size: '1280x160', config: homeTopAd, setter: setHomeTopAd, icon: Monitor, color: 'text-purple-600', bg: 'bg-purple-50' },
                { id: 'home', title: 'Anasayfa Orta Reklamı', size: '1280x160', config: homeAd, setter: setHomeAd, icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' },
                { id: 'detail', title: 'Haber Detay Reklamı', size: '730x160', config: detailAd, setter: setDetailAd, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' }
              ].map((slot) => (
                <div key={slot.id} className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${slot.bg} rounded-sm flex items-center justify-center ${slot.color}`}>
                        <slot.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{slot.title}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{slot.size}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => saveAdSlot(slot.id as any, slot.config)}
                      disabled={isSavingAds}
                      className="px-4 py-2 bg-gray-900 text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingAds ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                      Bu Alanı Kaydet
                    </button>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-8">
                    <div className="space-y-5">
                      <div className="flex p-1 bg-gray-50 rounded-sm">
                        <button 
                          type="button"
                          onClick={() => slot.setter({...slot.config, type: 'image'})}
                          className={`flex-1 py-2 px-3 rounded-sm font-bold text-xs transition-all ${slot.config.type === 'image' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Görsel
                        </button>
                        <button 
                          type="button"
                          onClick={() => slot.setter({...slot.config, type: 'code'})}
                          className={`flex-1 py-2 px-3 rounded-sm font-bold text-xs transition-all ${slot.config.type === 'code' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Kod
                        </button>
                      </div>

                      {slot.config.type === 'image' ? (
                        <div className="space-y-4">
                          <div className="relative group/upload">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleAdImageUpload(e, slot.id as any)} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                              disabled={isUploadingAd === slot.id}
                            />
                            <div className="w-full aspect-[1280/160] bg-gray-50 border-2 border-dashed border-gray-100 rounded-sm flex flex-col items-center justify-center gap-2 group-hover/upload:border-red-200 transition-colors overflow-hidden relative">
                              {isUploadingAd === slot.id ? (
                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                                  <Loader2 className="animate-spin text-red-600 mb-2" size={24} />
                                  <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden mb-1">
                                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${adUploadProgress[slot.id] || 0}%` }}></div>
                                  </div>
                                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Yükleniyor %{adUploadProgress[slot.id] || 0}</span>
                                </div>
                              ) : null}
                              
                              {slot.config.imageUrl ? (
                                <div className="relative w-full h-full group/img">
                                  <img src={normalizeImageUrl(slot.config.imageUrl)} className="w-full h-full object-cover" alt="" />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAdImageDelete(slot.id as any);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-sm opacity-0 group-hover/img:opacity-100 transition-all shadow-lg hover:bg-red-700 z-20"
                                    title="Görseli Sil"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <ImageIcon className="text-gray-300" size={24} />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Görsel Seç (Max 5MB)</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Yönlendirme Linki</label>
                            <input 
                              type="text" 
                              value={slot.config.link || ''} 
                              onChange={(e) => slot.setter({...slot.config, link: e.target.value})} 
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-sm text-sm font-medium outline-none focus:ring-1 focus:ring-red-500 transition-all" 
                              placeholder="https://..." 
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Reklam Kodu (HTML/JS)</label>
                          <textarea 
                            value={slot.config.adCode || ''} 
                            onChange={(e) => slot.setter({...slot.config, adCode: e.target.value})} 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm font-mono h-[140px] resize-none outline-none focus:ring-1 focus:ring-red-500 transition-all" 
                            placeholder="<script>...</script>" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-sm p-6 flex flex-col items-center justify-center text-center border border-gray-100">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Monitor className="text-gray-300" size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Önizleme Alanı</h4>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                        {slot.id === 'home_top' ? 'Anasayfanın en üstünde, logonun hemen altında görünür.' : 
                         slot.id === 'home' ? 'Anasayfada öne çıkan haberlerin altında görünür.' : 
                         'Haber detay sayfalarında içerik altında görünür.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Ads */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-sm flex items-center justify-center text-purple-600">
                    <Layout size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900">Yan Panel Reklamları</h3>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-8">
                <div className="space-y-6">
                  {/* Add New Sidebar Ad */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-sm border border-gray-100">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Yeni Reklam Ekle</h4>
                    
                    <div className="flex p-1 bg-white rounded-sm border border-gray-100">
                      <button 
                        type="button"
                        onClick={() => setNewSidebarAd({...newSidebarAd, type: 'image'})}
                        className={`flex-1 py-1.5 px-3 rounded-sm font-bold text-[10px] transition-all ${newSidebarAd.type === 'image' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Görsel
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewSidebarAd({...newSidebarAd, type: 'code'})}
                        className={`flex-1 py-1.5 px-3 rounded-sm font-bold text-[10px] transition-all ${newSidebarAd.type === 'code' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Kod
                      </button>
                    </div>

                    {newSidebarAd.type === 'image' ? (
                      <div className="space-y-3">
                        <div className="relative group">
                          <input type="file" accept="image/*" onChange={handleSidebarAdImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="w-full aspect-video bg-white border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center gap-1 group-hover:border-red-200 transition-colors overflow-hidden relative">
                            {isUploadingImage ? (
                              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                                <Loader2 className="animate-spin text-red-600 mb-2" size={20} />
                                <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden mb-1">
                                  <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <span className="text-[8px] font-bold text-red-600 uppercase tracking-tighter">Yükleniyor %{uploadProgress}</span>
                              </div>
                            ) : null}
                            
                            {newSidebarAd.imageUrl ? (
                              <div className="relative w-full h-full group/sidebar-img">
                                <img src={normalizeImageUrl(newSidebarAd.imageUrl)} className="w-full h-full object-cover" alt="" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSidebarAdImageDelete();
                                  }}
                                  className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-sm opacity-0 group-hover/sidebar-img:opacity-100 transition-all shadow-lg hover:bg-red-700 z-20"
                                  title="Görseli Sil"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="text-gray-300" size={20} />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Görsel Seç</span>
                              </>
                            )}
                          </div>
                        </div>
                        <input type="text" value={newSidebarAd.link || ''} onChange={(e) => setNewSidebarAd({...newSidebarAd, link: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm text-xs font-medium outline-none focus:ring-1 focus:ring-red-500 transition-all" placeholder="Hedef Link" />
                      </div>
                    ) : (
                      <textarea value={newSidebarAd.adCode || ''} onChange={(e) => setNewSidebarAd({...newSidebarAd, adCode: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm text-xs font-mono h-24 resize-none outline-none focus:ring-1 focus:ring-red-500 transition-all" placeholder="<script>...</script>" />
                    )}

                    <button 
                      type="button"
                      onClick={handleSidebarAdSubmit}
                      disabled={newSidebarAd.type === 'image' ? !newSidebarAd.imageUrl : !newSidebarAd.adCode}
                      className="w-full py-2.5 bg-gray-900 text-white rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reklamı Ekle
                    </button>
                  </div>
                </div>

                {/* Sidebar Ads List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mevcut Reklamlar ({sidebarAds.length})</h4>
                  <div className="space-y-3">
                    {sidebarAds.map((ad) => (
                      <div key={ad.id} className="group relative bg-white border border-gray-100 rounded-sm overflow-hidden flex items-center p-2 gap-3 hover:border-red-100 transition-all">
                        <div className="w-16 h-12 bg-gray-50 rounded-sm overflow-hidden flex-shrink-0">
                          {ad.type === 'image' ? (
                            <img src={normalizeImageUrl(ad.imageUrl)} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FileText size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate">{ad.type === 'image' ? 'Görsel Reklam' : 'Kod Reklamı'}</p>
                          <p className="text-[9px] text-gray-400 truncate">{ad.link || 'Link yok'}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => deleteSidebarAd(ad.id!)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {sidebarAds.length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-gray-50 rounded-sm">
                        <p className="text-[10px] font-bold text-gray-300 uppercase">Reklam Bulunmuyor</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'service-settings' && (
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Servis Ayarları</h2>
            <p className="text-gray-500 mt-1 font-medium">Her servis için ayrı şehir ve ilçe belirleyerek verilerin dinamik olarak çekilmesini sağlayın.</p>
          </div>

          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
            <form onSubmit={handleConfigSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                {/* Pharmacy Settings */}
                <div className="p-6 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-600 rounded-sm flex items-center justify-center text-white shadow-lg shadow-red-100">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Nöbetçi Eczaneler</h3>
                      <p className="text-xs text-gray-500 font-medium">Eczane verilerinin çekileceği konumu seçin.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Şehir (İl)</label>
                      <CitySelect value={pharmacyCity} onChange={setPharmacyCity} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">İlçe (Opsiyonel)</label>
                      <DistrictSelect value={pharmacyDistrict} onChange={setPharmacyDistrict} city={pharmacyCity} />
                    </div>
                  </div>
                </div>

                {/* Weather Settings */}
                <div className="p-6 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-sm flex items-center justify-center text-white shadow-lg shadow-blue-100">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Hava Durumu</h3>
                      <p className="text-xs text-gray-500 font-medium">Hava durumu tahminlerinin çekileceği konumu seçin.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Şehir (İl)</label>
                      <CitySelect value={weatherCity} onChange={setWeatherCity} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">İlçe (Opsiyonel)</label>
                      <DistrictSelect value={weatherDistrict} onChange={setWeatherDistrict} city={weatherCity} />
                    </div>
                  </div>
                </div>

                {/* Traffic Settings */}
                <div className="p-6 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-600 rounded-sm flex items-center justify-center text-white shadow-lg shadow-orange-100">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Trafik Durumu</h3>
                      <p className="text-xs text-gray-500 font-medium">Canlı trafik haritasının merkezleneceği konumu seçin.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Şehir (İl)</label>
                      <CitySelect value={trafficCity} onChange={setTrafficCity} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">İlçe (Opsiyonel)</label>
                      <DistrictSelect value={trafficDistrict} onChange={setTrafficDistrict} city={trafficCity} />
                    </div>
                  </div>
                </div>

                {/* Prayer Times Settings */}
                <div className="p-6 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-600 rounded-sm flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Namaz Vakitleri</h3>
                      <p className="text-xs text-gray-500 font-medium">Namaz vakitlerinin çekileceği konumu seçin.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Şehir (İl)</label>
                      <CitySelect value={prayerCity} onChange={setPrayerCity} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">İlçe (Opsiyonel)</label>
                      <DistrictSelect value={prayerDistrict} onChange={setPrayerDistrict} city={prayerCity} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`w-full bg-red-600 text-white py-5 rounded-sm font-black text-lg hover:bg-red-700 transition-all shadow-2xl shadow-red-100 flex items-center justify-center gap-3 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      GÜNCELLENİYOR...
                    </>
                  ) : (
                    <>
                      <Check size={24} /> SERVİS AYARLARINI KAYDET
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Genel Ayarlar</h2>
            <p className="text-gray-500 mt-1 font-medium">Sitenizin temel bilgilerini ve görünümünü buradan özelleştirin.</p>
          </div>

          <div className="bg-white p-10 rounded-sm shadow-sm border border-gray-100">
            <form onSubmit={handleConfigSubmit} className="space-y-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Site Adı (Görünen)</label>
                  <input 
                    type="text" 
                    value={siteName} 
                    onChange={(e) => setSiteName(e.target.value)} 
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold text-gray-800 text-lg" 
                    placeholder="Sitenizin adını girin..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-gray-50">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-l-4 border-red-600 pl-4">SEO Ayarları</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Site Başlığı (Meta Title)</label>
                    <input 
                      type="text" 
                      value={siteTitle} 
                      onChange={(e) => setSiteTitle(e.target.value)} 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold text-gray-800" 
                      placeholder="Arama motorlarında görünecek başlık..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Site Açıklaması (Meta Description)</label>
                    <textarea 
                      value={siteDescription} 
                      onChange={(e) => setSiteDescription(e.target.value)} 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium text-gray-700 h-24 resize-none" 
                      placeholder="Sitenizin kısa bir açıklamasını yazın..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Anahtar Kelimeler (Meta Keywords)</label>
                    <input 
                      type="text" 
                      value={siteKeywords} 
                      onChange={(e) => setSiteKeywords(e.target.value)} 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium text-gray-700" 
                      placeholder="Kelime1, Kelime2, Kelime3..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Alt Bilgi Yazısı (Footer Copyright)</label>
                  <input 
                    type="text" 
                    value={footerText} 
                    onChange={(e) => setFooterText(e.target.value)} 
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-bold text-gray-800" 
                    placeholder="© 2026 DİNÇ SIHHİ TESİSAT. Tüm hakları saklıdır."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kurumsal Logo</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative border-2 border-dashed border-gray-200 rounded-sm p-10 hover:border-red-500 transition-all group cursor-pointer bg-gray-50 flex flex-col items-center justify-center text-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-16 h-16 bg-white rounded-sm shadow-sm flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors mb-4">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-sm font-bold text-gray-600">Yeni Logo Yükle</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">PNG veya SVG önerilir</p>
                    </div>

                    <div className="p-10 border border-gray-100 rounded-sm bg-white flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Mevcut Logo</p>
                      {logoUrl ? (
                        <div className="relative group/logo-preview">
                          <img src={normalizeImageUrl(logoUrl)} alt="Logo Önizleme" className="max-h-16 object-contain" />
                          <button
                            type="button"
                            onClick={handleLogoDelete}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-sm opacity-0 group-hover/logo-preview:opacity-100 transition-all shadow-lg hover:bg-red-700 z-20"
                            title="Logoyu Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-200 italic text-sm">Logo ayarlanmamış</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`w-full bg-red-600 text-white py-5 rounded-sm font-black text-lg hover:bg-red-700 transition-all shadow-2xl shadow-red-100 flex items-center justify-center gap-3 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      GÜNCELLENİYOR...
                    </>
                  ) : (
                    <>
                      <Check size={24} /> AYARLARI KAYDET
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

              {activeTab === 'categories' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900">Kategori Yönetimi</h2>
                      <p className="text-gray-500 mt-1 font-medium">Haber kategorilerini düzenleyin ve yönetin.</p>
                    </div>
                    <button 
                      onClick={seedData}
                      className="bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-sm font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                    >
                      <FolderPlus size={20} className="text-red-600" /> Örnek Haberleri Yükle
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add/Edit Form */}
                    <div className="lg:col-span-1">
                      <div className={`bg-white p-8 rounded-sm shadow-sm border transition-all duration-500 sticky top-28 ${editingCategoryId ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-100'}`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${editingCategoryId ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
                            {editingCategoryId ? <Edit3 size={18} /> : <Plus size={18} />}
                          </div>
                          {editingCategoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                        </h3>
                        
                        <form onSubmit={handleCategorySubmit} className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Adı</label>
                            <input 
                              type="text" 
                              value={newCategory.name} 
                              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} 
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                              placeholder="Örn: Ekonomi"
                              required 
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Rengi</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={newCategory.color} 
                                onChange={(e) => setNewCategory({...newCategory, color: e.target.value})} 
                                className="w-12 h-12 rounded-sm border-none cursor-pointer overflow-hidden p-0"
                              />
                              <input 
                                type="text" 
                                value={newCategory.color} 
                                onChange={(e) => setNewCategory({...newCategory, color: e.target.value})} 
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-gray-50">
                            <IOSSwitch 
                              label="Menüde Göster" 
                              checked={newCategory.showInMenu} 
                              onChange={(val) => setNewCategory({...newCategory, showInMenu: val})} 
                            />
                            <IOSSwitch 
                              label="Anasayfada Göster" 
                              checked={newCategory.showOnHomepage} 
                              onChange={(val) => setNewCategory({...newCategory, showOnHomepage: val})} 
                            />
                            <IOSSwitch 
                              label="Aktif/Pasif" 
                              checked={newCategory.isActive} 
                              onChange={(val) => setNewCategory({...newCategory, isActive: val})} 
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button 
                              type="submit" 
                              className="flex-1 bg-red-600 text-white py-4 rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                            >
                              {editingCategoryId ? 'Güncelle' : 'Ekle'}
                            </button>
                            {editingCategoryId && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  setEditingCategoryId(null);
                                  setNewCategory({ name: '', showInMenu: true, showOnHomepage: false, color: '#e60026', isActive: true });
                                }}
                                className="px-6 bg-gray-100 text-gray-600 py-4 rounded-sm font-bold hover:bg-gray-200 transition-all"
                              >
                                İptal
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Categories List */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 gap-4">
                        {categories.map((cat) => (
                          <div 
                            key={`cat-card-${cat.id}`} 
                            className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-100 transition-all"
                          >
                            <div className="flex items-center gap-5">
                              <div 
                                className="w-12 h-12 rounded-sm flex items-center justify-center shadow-inner"
                                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                              >
                                <Grid size={24} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900 text-lg">{cat.name}</h4>
                                  {!cat.isActive && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-sm">Pasif</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    <Monitor size={12} className={cat.showOnHomepage ? 'text-green-500' : ''} /> Anasayfa
                                  </div>
                                  <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    <List size={12} className={cat.showInMenu ? 'text-green-500' : ''} /> Menü
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <IOSSwitch 
                                checked={cat.isActive} 
                                onChange={() => toggleCategoryStatus(cat)} 
                              />
                              <div className="h-8 w-[1px] bg-gray-50"></div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => startEditCategory(cat)}
                                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                >
                                  <Edit3 size={20} />
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirmId(cat.id)}
                                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {categories.length === 0 && (
                          <div className="text-center py-20 bg-white rounded-sm border-2 border-dashed border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <List className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-500 font-bold">Henüz kategori eklenmemiş.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'top-menu' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900">Üst Menü Yönetimi</h2>
                      <p className="text-gray-500 mt-1 font-medium">Sitenin en üstündeki kırmızı barda yer alan linkleri yönetin.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <div className={`bg-white p-8 rounded-sm shadow-sm border transition-all duration-500 sticky top-28 ${editingTopMenuId ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-100'}`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${editingTopMenuId ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
                            {editingTopMenuId ? <Edit3 size={18} /> : <Plus size={18} />}
                          </div>
                          {editingTopMenuId ? 'Linki Düzenle' : 'Yeni Link Ekle'}
                        </h3>
                        
                        <form onSubmit={handleTopMenuSubmit} className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Link Başlığı</label>
                            <input 
                              type="text" 
                              value={newTopMenuLink.title} 
                              onChange={(e) => setNewTopMenuLink({...newTopMenuLink, title: e.target.value})} 
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                              placeholder="Örn: KÜNYE"
                              required 
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL</label>
                            <input 
                              type="text" 
                              value={newTopMenuLink.url} 
                              onChange={(e) => setNewTopMenuLink({...newTopMenuLink, url: e.target.value})} 
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                              placeholder="Örn: /kunye"
                              required 
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">İkon (Lucide)</label>
                            <select 
                              value={newTopMenuLink.icon} 
                              onChange={(e) => setNewTopMenuLink({...newTopMenuLink, icon: e.target.value})} 
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                            >
                              <option value="">İkon Yok</option>
                              {['Users', 'Mic', 'MapPin', 'BookOpen', 'BarChart2', 'Newspaper', 'Search', 'Menu', 'Clock', 'Home', 'Info', 'Phone', 'Mail', 'Globe'].map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sıralama</label>
                              <input 
                                type="number" 
                                value={newTopMenuLink.orderIndex} 
                                onChange={(e) => setNewTopMenuLink({...newTopMenuLink, orderIndex: parseInt(e.target.value)})} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pozisyon</label>
                              <select 
                                value={newTopMenuLink.position} 
                                onChange={(e) => setNewTopMenuLink({...newTopMenuLink, position: e.target.value as 'left' | 'right'})} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                              >
                                <option value="left">Sol (Beyaz Arkaplanlı)</option>
                                <option value="right">Sağ (İkonlu Liste)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button 
                              type="submit" 
                              className="flex-1 bg-red-600 text-white py-4 rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                            >
                              {editingTopMenuId ? 'Güncelle' : 'Ekle'}
                            </button>
                            {editingTopMenuId && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  setEditingTopMenuId(null);
                                  setNewTopMenuLink({ title: '', url: '', icon: '', orderIndex: 0, position: 'right' });
                                }}
                                className="px-6 bg-gray-100 text-gray-600 py-4 rounded-sm font-bold hover:bg-gray-200 transition-all"
                              >
                                İptal
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 pb-4 border-b border-gray-50">Sol Menü Linkleri</h3>
                          <div className="space-y-3">
                            {topMenuLinks.filter(l => l.position === 'left').map((link) => (
                              <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-sm border border-gray-100 group">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-gray-400 font-bold border border-gray-100">
                                    {link.orderIndex}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900">{link.title}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{link.url}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {deletingTopMenuId === link.id ? (
                                    <div className="flex items-center gap-2 bg-red-50 p-1 rounded-sm border border-red-100 animate-pulse">
                                      <span className="text-[10px] font-bold text-red-600 px-2 uppercase tracking-tighter">Emin misiniz?</span>
                                      <button 
                                        onClick={() => deleteTopMenuLink(link.id)} 
                                        className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-sm hover:bg-red-700 transition-colors uppercase"
                                      >
                                        SİL
                                      </button>
                                      <button 
                                        onClick={() => setDeletingTopMenuId(null)} 
                                        className="text-gray-400 hover:text-gray-600 text-[10px] font-bold px-2 py-1 uppercase"
                                      >
                                        İPTAL
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button onClick={() => startEditTopMenu(link)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"><Edit3 size={16} /></button>
                                      <button onClick={() => setDeletingTopMenuId(link.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"><Trash2 size={16} /></button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 pb-4 border-b border-gray-50">Sağ Menü Linkleri</h3>
                          <div className="space-y-3">
                            {topMenuLinks.filter(l => l.position === 'right').map((link) => (
                              <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-sm border border-gray-100 group">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-gray-400 font-bold border border-gray-100">
                                    {link.orderIndex}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                      {link.title}
                                      {link.icon && <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{link.icon}</span>}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{link.url}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {deletingTopMenuId === link.id ? (
                                    <div className="flex items-center gap-2 bg-red-50 p-1 rounded-sm border border-red-100 animate-pulse">
                                      <span className="text-[10px] font-bold text-red-600 px-2 uppercase tracking-tighter">Emin misiniz?</span>
                                      <button 
                                        onClick={() => deleteTopMenuLink(link.id)} 
                                        className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-sm hover:bg-red-700 transition-colors uppercase"
                                      >
                                        SİL
                                      </button>
                                      <button 
                                        onClick={() => setDeletingTopMenuId(null)} 
                                        className="text-gray-400 hover:text-gray-600 text-[10px] font-bold px-2 py-1 uppercase"
                                      >
                                        İPTAL
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button onClick={() => startEditTopMenu(link)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"><Edit3 size={16} /></button>
                                      <button onClick={() => setDeletingTopMenuId(link.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"><Trash2 size={16} /></button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'menus' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900">Ana Menü Yönetimi</h2>
                      <p className="text-gray-500 mt-1 font-medium">Sitenin ana navigasyon menüsünü yönetin.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <div className={`bg-white p-8 rounded-sm shadow-sm border transition-all duration-500 sticky top-28 ${editingMenuId ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-100'}`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${editingMenuId ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
                            {editingMenuId ? <Edit3 size={18} /> : <Plus size={18} />}
                          </div>
                          {editingMenuId ? 'Menüyü Düzenle' : 'Yeni Menü Ekle'}
                        </h3>
                        
                        <form onSubmit={handleMenuSubmit} className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menü Başlığı</label>
                            <input 
                              type="text" 
                              value={newMenu.title} 
                              onChange={(e) => setNewMenu({...newMenu, title: e.target.value})} 
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                              placeholder="Örn: GÜNDEM"
                              required 
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL</label>
                            <input 
                              type="text" 
                              value={newMenu.url} 
                              onChange={(e) => setNewMenu({...newMenu, url: e.target.value})} 
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                              placeholder="Örn: /category/gundem"
                              required 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sıralama</label>
                              <input 
                                type="number" 
                                value={newMenu.order} 
                                onChange={(e) => setNewMenu({...newMenu, order: parseInt(e.target.value)})} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium" 
                              />
                            </div>
                            <div className="flex items-end pb-3">
                              <IOSSwitch 
                                checked={newMenu.is_active} 
                                onChange={(val) => setNewMenu({...newMenu, is_active: val})} 
                                label="Aktif"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button 
                              type="submit" 
                              className="flex-1 bg-red-600 text-white py-4 rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                            >
                              {editingMenuId ? 'Güncelle' : 'Ekle'}
                            </button>
                            {editingMenuId && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  setEditingMenuId(null);
                                  setNewMenu({ title: '', url: '', order: 0, is_active: true, parent_id: null });
                                }}
                                className="px-6 bg-gray-100 text-gray-600 py-4 rounded-sm font-bold hover:bg-gray-200 transition-all"
                              >
                                İptal
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sıra</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Başlık</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">URL</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {menus.map((menu) => (
                                <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors group">
                                  <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-gray-400">{menu.order}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900">{menu.title}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-gray-500">{menu.url}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${menu.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                      {menu.is_active ? 'AKTİF' : 'PASİF'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {deletingMenuId === menu.id ? (
                                        <div className="flex items-center gap-2 bg-red-50 p-1 rounded-sm border border-red-100 animate-pulse">
                                          <span className="text-[10px] font-bold text-red-600 px-2 uppercase tracking-tighter">Emin misiniz?</span>
                                          <button 
                                            onClick={() => deleteMenu(menu.id)} 
                                            className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-sm hover:bg-red-700 transition-colors uppercase"
                                          >
                                            SİL
                                          </button>
                                          <button 
                                            onClick={() => setDeletingMenuId(null)} 
                                            className="text-gray-400 hover:text-gray-600 text-[10px] font-bold px-2 py-1 uppercase"
                                          >
                                            İPTAL
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => startEditMenu(menu)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"
                                          >
                                            <Edit3 size={16} />
                                          </button>
                                          <button 
                                            onClick={() => setDeletingMenuId(menu.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Galeri Yönetimi</h2>
              <p className="text-gray-500 mt-1 font-medium">Sitenizde kullanılan tüm görselleri buradan yönetin.</p>
            </div>
            <div className="relative group">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleGalleryUpload} 
                disabled={isUploadingImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              />
              <button 
                disabled={isUploadingImage}
                className={`bg-red-600 text-white px-8 py-4 rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploadingImage ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Plus size={20} />
                )}
                {isUploadingImage ? (
                  <div className="flex items-center gap-2">
                    <span>{`Yükleniyor... %${uploadProgress}`}</span>
                  </div>
                ) : 'Yeni Görsel Yükle'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {galleryImages.map((image) => (
              <div key={image.id} className="group relative bg-white rounded-sm overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="aspect-square overflow-hidden bg-gray-50">
                  {image.url ? (
                    <img 
                      src={normalizeImageUrl(image.url)} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/${image.id}/300/300`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => window.open(image.url, '_blank')}
                    className="p-3 bg-white/20 backdrop-blur-md text-white rounded-sm hover:bg-white/40 transition-all"
                    title="Görüntüle"
                  >
                    <ExternalLink size={20} />
                  </button>
                  <button 
                    onClick={() => deleteGalleryImage(image.id)}
                    className="p-3 bg-red-600/80 backdrop-blur-md text-white rounded-sm hover:bg-red-600 transition-all"
                    title="Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="p-3 border-t border-gray-50 bg-white">
                  <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-wider">
                    {new Date(image.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
            {galleryImages.length === 0 && (
              <div className="col-span-full py-24 text-center bg-gray-50 rounded-sm border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-sm shadow-sm flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <ImageIcon size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Galeri Henüz Boş</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">Haberlerinizde kullanmak için görseller yüklemeye başlayın.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Firma Rehberi Yönetimi</h2>
              <p className="text-gray-500 mt-1 font-medium">Firma başvurularını onaylayın, düzenleyin veya silin.</p>
            </div>
          </div>

          {editingCompanyId && (
            <div className="bg-white p-8 rounded-sm shadow-sm border border-red-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 text-white rounded-sm flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                Firmayı Düzenle
              </h3>
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Firma Adı</label>
                    <input 
                      type="text" 
                      value={companyFormData.name} 
                      onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori</label>
                    <input 
                      type="text" 
                      value={companyFormData.category} 
                      onChange={(e) => setCompanyFormData({...companyFormData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Yetkili</label>
                    <input 
                      type="text" 
                      value={companyFormData.authorizedPerson} 
                      onChange={(e) => setCompanyFormData({...companyFormData, authorizedPerson: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Telefon</label>
                    <input 
                      type="text" 
                      value={companyFormData.phone} 
                      onChange={(e) => setCompanyFormData({...companyFormData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp</label>
                    <input 
                      type="text" 
                      value={companyFormData.whatsapp} 
                      onChange={(e) => setCompanyFormData({...companyFormData, whatsapp: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">İlçe</label>
                    <input 
                      type="text" 
                      value={companyFormData.district} 
                      onChange={(e) => setCompanyFormData({...companyFormData, district: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Adres</label>
                  <textarea 
                    value={companyFormData.address} 
                    onChange={(e) => setCompanyFormData({...companyFormData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Açıklama</label>
                  <textarea 
                    value={companyFormData.description} 
                    onChange={(e) => setCompanyFormData({...companyFormData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium h-32 resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    disabled={isSavingCompany}
                    className="bg-red-600 text-white px-8 py-3 rounded-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    {isSavingCompany ? 'Kaydediliyor...' : 'Güncelle'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingCompanyId(null)}
                    className="bg-gray-100 text-gray-600 px-8 py-3 rounded-sm font-bold hover:bg-gray-200 transition-all"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Firma Bilgileri</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">İletişim</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Konum</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-sm bg-gray-100 border border-gray-100 overflow-hidden flex items-center justify-center">
                          {company.logo ? (
                            <img src={normalizeImageUrl(company.logo)} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <Building2 size={20} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <h4 className="font-bold text-gray-900">{company.name}</h4>
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{company.category}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">{new Date(company.createdAt).toLocaleDateString('tr-TR')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <Phone size={12} className="text-gray-400" /> {company.phone}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <MessageCircle size={12} className="text-green-500" /> {company.whatsapp}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                          <MapPin size={12} className="text-red-500" /> {company.district}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleCompanyStatusToggle(company)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            company.isApproved 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-orange-50 text-orange-600 border border-orange-100'
                          }`}
                        >
                          {company.isApproved ? 'Onaylı' : 'Beklemede'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => startEditCompany(company)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"
                            title="Düzenle"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => deleteCompany(company.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {companies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Building2 className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-500 font-bold">Henüz firma kaydı bulunmuyor.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
