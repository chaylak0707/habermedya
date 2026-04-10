import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, Menu, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { useAppData } from '../AppDataContext';
import { normalizeImageUrl, slugify } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TopMenuLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  orderIndex: number;
  position: 'left' | 'right';
}

export default function Header() {
  const appData = useAppData();
  const { logoUrl, siteName, categories, articles, menus } = appData || { logoUrl: '', siteName: '', categories: [], articles: [], menus: [] };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [breakingNewsIndex, setBreakingNewsIndex] = useState(0);
  const [topMenuLinks, setTopMenuLinks] = useState<TopMenuLink[]>([]);

  const breakingNews = (articles || []).filter((a: any) => a.isActive && a.displayOptions?.isBreaking);
  const menuCategories = (categories || []).filter((c: any) => c.showInMenu && c.isActive);
  const visibleCategories = menuCategories.slice(0, 6);
  const dropdownCategories = menuCategories.slice(6);

  useEffect(() => {
    const fetchTopMenu = async () => {
      try {
        const response = await fetch("/api/admin/top-menu");
        if (response.ok) {
          const data = await response.json();
          setTopMenuLinks(data);
        }
      } catch (error) {
        console.error("Error fetching top menu links:", error);
      }
    };
    fetchTopMenu();
  }, []);

  useEffect(() => {
    if (breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setBreakingNewsIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [breakingNews.length]);

  const currentBreaking = breakingNews[breakingNewsIndex];

  const renderIcon = (iconName: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={14} /> : null;
  };

  const leftLinks = topMenuLinks.filter(l => l.position === 'left');
  const rightLinks = topMenuLinks.filter(l => l.position === 'right');

  return (
    <header className="w-full">
      {/* Top Red Bar */}
      <div className="bg-[#e60026] text-white py-2 text-xs sm:text-sm">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center px-2 sm:px-4">
          <div className="flex space-x-2 sm:space-x-4">
            {leftLinks.map((link) => (
              <Link 
                key={link.id} 
                to={link.url} 
                className={`px-2 sm:px-3 py-1 rounded font-black flex items-center gap-1 ${link.id === 'kunye' ? 'bg-white text-[#e60026]' : 'border border-white'}`}
              >
                {renderIcon(link.icon)}
                {link.title}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-6 ml-auto">
            <div className="flex space-x-6 items-center">
              {rightLinks.map((link) => (
                <Link key={link.id} to={link.url} className="flex items-center gap-1 hover:opacity-80 transition-opacity font-black">
                  {renderIcon(link.icon)}
                  {link.title}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 border-l border-white/20 pl-6">
               <Search size={18} className="cursor-pointer hover:scale-110 transition-transform" />
               <Menu size={18} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsMenuOpen(!isMenuOpen)} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center py-2 md:py-6 px-2 sm:px-4">
          <Link to="/" className="flex items-center">
            {logoUrl && (
              <img src={normalizeImageUrl(logoUrl)} alt={siteName} className="w-auto max-h-10 md:max-h-12 object-contain" loading="eager" />
            )}
            {!logoUrl && (
              <div className="text-2xl md:text-3xl font-bold">
                <span className="text-gray-600">MEGA</span>
                <span className="bg-[#e60026] text-white px-2 py-1 ml-1 rounded">HABER</span>
              </div>
            )}
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-6 text-[18px] font-bold text-gray-800 font-['Roboto'] items-center">
            {/* Home Link */}
            {(menus || []).filter(m => m.id === 'home').map((menu: any) => (
              <Link key={menu.id} to={menu.url} className="hover:text-[#e60026]">{menu.title?.toUpperCase()}</Link>
            ))}

            {/* Categories */}
            {visibleCategories.map((cat: any) => (
              <Link key={cat.id} to={`/category/${slugify(cat.name || '')}`} className="hover:text-[#e60026]">
                {cat.name?.toUpperCase()}
              </Link>
            ))}

            {/* Dropdown for more categories */}
            {dropdownCategories.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-[#e60026] uppercase">
                  DİĞER <ChevronDown size={16} />
                </button>
                <div className="absolute top-full left-0 bg-white shadow-xl border border-gray-100 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {dropdownCategories.map((cat: any) => (
                    <Link 
                      key={cat.id} 
                      to={`/category/${slugify(cat.name || '')}`} 
                      className="block px-4 py-2 hover:bg-gray-50 hover:text-[#e60026] transition-colors"
                    >
                      {cat.name?.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Other dynamic menus */}
            {(menus || []).filter(m => m.id !== 'home').map((menu: any) => (
              <Link key={menu.id} to={menu.url} className="hover:text-[#e60026]">{menu.title?.toUpperCase()}</Link>
            ))}
            
            <Search key="search" size={20} className="cursor-pointer" />
            <Menu key="menu" size={20} className="cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </nav>

          {/* Mobile Menu Toggle (Visible on Tablet/Mobile) */}
          <div className="lg:hidden flex items-center gap-4">
             <Search size={22} className="cursor-pointer text-gray-700" />
             <Menu size={22} className="cursor-pointer text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-white z-[101] shadow-xl p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="font-bold text-xl">MENÜ</div>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-500">✕</button>
              </div>
              <nav className="flex flex-col space-y-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold border-b pb-2">ANASAYFA</Link>
                
                {/* Categories in mobile */}
                {menuCategories.map((cat: any) => (
                  <Link 
                    key={`mobile-cat-${cat.id}`} 
                    to={`/category/${slugify(cat.name || '')}`} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold border-b pb-2 hover:text-[#e60026]"
                  >
                    {cat.name?.toUpperCase()}
                  </Link>
                ))}

                {/* Other menus */}
                {(menus || []).filter((m: any) => m.id !== 'home').map((menu: any) => (
                  <Link 
                    key={`mobile-${menu.id}`} 
                    to={menu.url} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold border-b pb-2 hover:text-[#e60026]"
                  >
                    {menu.title?.toUpperCase()}
                  </Link>
                ))}
                
                <div className="pt-6 space-y-4">
                  {topMenuLinks.map((link) => (
                    <Link 
                      key={`mobile-${link.id}`} 
                      to={link.url} 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-600 hover:text-[#e60026] transition-colors"
                    >
                      {renderIcon(link.icon)}
                      <span className="font-bold">{link.title}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Breaking News Bar */}
      <div className="bg-gray-200 py-2">
        <div className="max-w-[1280px] mx-auto flex items-center px-2 sm:px-4 gap-2 md:gap-4">
          <div className="bg-[#e60026] text-white px-2 md:px-4 py-2 flex items-center gap-1 md:gap-2 font-bold text-[10px] md:text-sm whitespace-nowrap flex-shrink-0">
            <Clock size={14} className="md:w-4 md:h-4" /> SON DAKİKA
          </div>
          <div className="hidden sm:flex gap-1 md:gap-2 flex-shrink-0">
            <button 
              onClick={() => setBreakingNewsIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length)}
              className="bg-white p-1 rounded hover:bg-gray-100 transition-colors"
              disabled={breakingNews.length <= 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setBreakingNewsIndex((prev) => (prev + 1) % breakingNews.length)}
              className="bg-white p-1 rounded hover:bg-gray-100 transition-colors"
              disabled={breakingNews.length <= 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="bg-white flex-grow p-2 text-[11px] md:text-sm text-gray-700 shadow-sm truncate min-w-0">
            {currentBreaking ? (
              <Link to={`/news/${currentBreaking.id}`} className="hover:text-[#e60026] transition-colors">
                <span className="text-[#e60026] font-bold mr-2">
                  {new Date(currentBreaking.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {currentBreaking.title}
              </Link>
            ) : (
              <span className="text-gray-400 italic">Son dakika haberi bulunamadı.</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
