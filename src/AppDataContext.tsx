import { createContext, useContext } from 'react';

export interface AppData {
  logoUrl: string;
  siteName: string;
  articles: any[];
  categories: any[];
  menus: any[];
  serviceBgs?: {
    stock: string;
    pharmacy: string;
    weather: string;
    prayer: string;
    traffic: string;
    results: string;
  };
  refreshData: () => Promise<void>;
}

export const AppDataContext = createContext<AppData | null>(null);

export const useAppData = () => useContext(AppDataContext);
