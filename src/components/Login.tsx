import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (admin: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.admin);
      } else {
        setError(data.error || 'Giriş başarısız');
      }
    } catch (err) {
      setError('Sunucu hatası oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-sm shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-[#e60026] p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Yönetim Paneli</h1>
          <p className="text-white/80 text-xs font-bold mt-2 uppercase tracking-tighter">Lütfen giriş yapın</p>
        </div>

        <div className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 flex items-center gap-3 text-red-700 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-gray-900"
                placeholder="Kullanıcı adınız"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e60026] text-white py-4 rounded-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#c40020] transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              GİRİŞ YAP
            </button>
          </form>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            © 2026 MEGA HABER YÖNETİM SİSTEMİ
          </p>
        </div>
      </motion.div>
    </div>
  );
}
