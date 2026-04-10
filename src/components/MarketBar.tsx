import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Euro, Coins, Sun, PieChart } from 'lucide-react';

interface MarketData {
  value: string;
  change: string;
  isUp: boolean;
}

interface WeatherData {
  temp: string;
  desc: string;
  city: string;
}

export default function MarketBar() {
  const [data, setData] = useState<{
    USD: MarketData;
    EUR: MarketData;
    ALTIN: MarketData;
    BIST: MarketData;
  }>({
    USD: { value: '44,5976', change: '0,04%', isUp: true },
    EUR: { value: '51,4786', change: '0,03%', isUp: true },
    ALTIN: { value: '6.689,01', change: '-0,23%', isUp: false },
    BIST: { value: '13.001', change: '0,50%', isUp: true },
  });

  const [weather, setWeather] = useState<WeatherData>({
    temp: '15.1',
    desc: 'Açık',
    city: 'Erdemli'
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Use internal API instead of external to avoid CORS/network issues
        const response = await fetch('/api/market');
        if (response.ok) {
          const json = await response.json();
          if (json && json.USD && json.EUR && json.GA && json.BIST100) {
            setData({
              USD: { 
                value: json.USD.satis.replace('.', ','), 
                change: json.USD.degisim.replace('.', ',') + '%', 
                isUp: json.USD.d_yon === 'up' 
              },
              EUR: { 
                value: json.EUR.satis.replace('.', ','), 
                change: json.EUR.degisim.replace('.', ',') + '%', 
                isUp: json.EUR.d_yon === 'up' 
              },
              ALTIN: { 
                value: json.GA.satis.replace('.', ','), 
                change: json.GA.degisim.replace('.', ',') + '%', 
                isUp: json.GA.d_yon === 'up' 
              },
              BIST: { 
                value: json.BIST100.satis.replace('.', ','), 
                change: json.BIST100.degisim.replace('.', ',') + '%', 
                isUp: json.BIST100.d_yon === 'up' 
              },
            });
          }
        } else {
          console.warn('Market data API returned status:', response.status);
        }
      } catch (error) {
        console.error('Market data fetch error:', error);
      }
    };

    const fetchWeather = async () => {
      try {
        // Use internal API instead of external wttr.in to avoid CORS/network issues
        const response = await fetch('/api/weather');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.current) {
            setWeather({
              temp: data.current.temp.toString(),
              desc: data.current.status,
              city: data.district || data.city
            });
          }
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };

    fetchMarketData();
    fetchWeather();
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchMarketData();
      fetchWeather();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const MarketItem = ({ icon: Icon, label, data }: { icon: any, label: string, data: MarketData }) => (
    <div className="flex items-center gap-3 px-3 md:px-6 py-1">
      <div className="text-gray-200">
        <Icon size={28} strokeWidth={1} />
      </div>
      <div className="flex flex-col min-w-[80px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight">{label}</span>
          {data.isUp ? (
            <span className="text-green-600 text-[8px] leading-none">▲</span>
          ) : (
            <span className="text-red-600 text-[8px] leading-none">▼</span>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-bold text-gray-900 leading-tight">{data.value}</span>
          <span className={`text-[11px] font-bold leading-tight ml-2 ${data.isUp ? 'text-green-600' : 'text-red-600'}`}>
            {data.change}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-8 md:mb-12 overflow-x-auto no-scrollbar">
      <div className="flex items-center min-w-max md:min-w-0 md:justify-between py-2 px-2">
        <MarketItem icon={PieChart} label="BIST" data={data.BIST} />
        <div className="w-px h-8 bg-gray-100 mx-1"></div>
        
        <MarketItem icon={DollarSign} label="DOLAR" data={data.USD} />
        <div className="w-px h-8 bg-gray-100 mx-1"></div>
        
        <MarketItem icon={Euro} label="EURO" data={data.EUR} />
        <div className="w-px h-8 bg-gray-100 mx-1"></div>
        
        <MarketItem icon={Coins} label="ALTIN" data={data.ALTIN} />
        <div className="w-px h-8 bg-gray-100 mx-1"></div>

        <div className="flex items-center gap-4 px-4 py-1 ml-auto">
          <div className="bg-[#f0f7fa] px-6 py-1.5 rounded-sm text-[11px] font-bold text-gray-700 flex items-center gap-1">
            {weather.city} - <span className="font-medium text-gray-500">{weather.desc}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sun size={24} className="text-yellow-400" strokeWidth={1.5} />
            <span className="text-lg font-bold text-gray-700">{weather.temp}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
