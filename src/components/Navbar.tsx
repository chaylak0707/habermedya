import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { db } from '../db';
import { fetchWithCache } from '../lib/utils';

export default function Navbar() {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const cats = (await fetchWithCache('menu_categories', 'categories')) as {id: string, name: string, showInMenu: number}[];
      setCategories(cats.filter(c => c.showInMenu === 1));
    };
    fetchData();
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold text-red-600">HABERPORTALI</Link>
        <div className="flex space-x-6 text-[18px]">
          <Link to="/" className="text-gray-700 hover:text-red-600">Ana Sayfa</Link>
          {categories.map((cat, index) => (
            <Link key={cat.id ? `nav-cat-${cat.id}` : `nav-cat-idx-${index}`} to={`/category/${cat.name?.toLowerCase().replace(/\s+/g, '-') || ''}`} className="text-gray-700 hover:text-red-600">{cat.name?.toUpperCase()}</Link>
          ))}
          <Link to="/resmi-ilanlar" className="text-gray-700 hover:text-red-600">RESMİ İLANLAR</Link>
        </div>
        <Search className="text-gray-700 cursor-pointer" />
      </div>
    </nav>
  );
}
