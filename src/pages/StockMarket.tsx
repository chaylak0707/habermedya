import React from 'react';
import ServiceLayout from '../components/ServiceLayout';

export default function StockMarket() {
  return (
    <ServiceLayout title="Canlı Borsa" breadcrumb="Canlı Borsa">
      <div className="w-full h-[800px] bg-gray-50 rounded overflow-hidden border border-gray-100">
        <iframe 
          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BIST%3AXU100&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Europe%2FIstanbul&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=tr" 
          className="w-full h-full border-none"
          title="Borsa"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="mt-8 text-gray-600 text-sm leading-relaxed">
        <p>
          Güncel borsa verileri, hisse senedi fiyatları, endeksler ve döviz kurlarını canlı olarak takip edebilirsiniz. 
          Veriler Bloomberg HT tarafından sağlanmaktadır.
        </p>
      </div>
    </ServiceLayout>
  );
}
