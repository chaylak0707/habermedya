import React, { useEffect, useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import { Loader2, Trophy, Clock, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface Match {
  skor: string;
  date: string;
  away: string;
  home: string;
}

interface ScoresData {
  success: boolean;
  result: Match[];
}

export default function MatchResults() {
  const [data, setData] = useState<ScoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scores');
      const result = await response.json();
      
      if (result.success && result.result) {
        setData(result);
        setError(null);
      } else {
        setError(result.message || 'Şu an maç sonuçları güncelleniyor, lütfen az sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
      setError('Şu an maç sonuçları güncelleniyor, lütfen az sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <ServiceLayout title="Canlı Maç Sonuçları" breadcrumb="Canlı Sonuçlar">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Trophy size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Süper Lig</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Maç Sonuçları</h2>
              <p className="text-gray-500 mt-1 font-medium">En güncel skorlar ve maç sonuçları.</p>
            </div>
            <button 
              onClick={fetchScores}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-sm font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Yenile
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-gray-100 shadow-sm">
            <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold animate-pulse">Sonuçlar Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-10 rounded-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertCircle size={32} />
            </div>
            <p className="text-red-800 font-bold text-lg">{error}</p>
          </div>
        ) : data && data.result.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {data.result.map((match, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm hover:border-red-200 transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Home Team */}
                  <div className="flex-1 text-center sm:text-right">
                    <h4 className="text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                      {match.home}
                    </h4>
                  </div>

                  {/* Score & Status */}
                  <div className="flex flex-col items-center gap-2 px-8 py-3 bg-gray-50 rounded-sm border border-gray-100 min-w-[140px]">
                    <div className="text-3xl font-black text-gray-900 tracking-widest">
                      {match.skor}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">MS</span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                      {match.away}
                    </h4>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                  </div>
                  <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(match.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Trophy size={32} />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Şu an listelenecek maç sonucu bulunamadı.</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4 items-start">
          <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center text-blue-600 flex-shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Bilgilendirme</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Maç sonuçları ve canlı skorlar anlık olarak güncellenmektedir. 
              Veriler CollectAPI altyapısı kullanılarak sağlanmaktadır. 
              Sistemimiz verileri 30 dakikada bir güncelleyerek hem güncel kalmasını sağlar hem de performansı optimize eder.
            </p>
          </div>
        </div>
      </div>
    </ServiceLayout>
  );
}
