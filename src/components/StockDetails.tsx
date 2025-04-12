
import React from 'react';
import { StockData } from '@/services/stockService';
import StockHeader from './stock/StockHeader';
import StockChart from './stock/StockChart';
import StockTabs from './stock/StockTabs';
import StockMetrics from './stock/StockMetrics';
import StockNews from './stock/StockNews';
import { getPerformanceData } from '@/utils/stockUtils';

interface StockDetailProps {
  stock: StockData;
  onBack: () => void;
}

const StockDetail: React.FC<StockDetailProps> = ({ stock, onBack }) => {
  const performanceData = getPerformanceData(stock.symbol);

  return (
    <div className="p-6">
      {/* Header with back button */}
      <StockHeader 
        symbol={stock.symbol} 
        name={stock.name} 
        price={stock.price} 
        change={stock.change} 
        changePercent={stock.changePercent} 
        onBack={onBack} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Chart and Tabs */}
        <div className="lg:col-span-2">
          <StockChart symbol={stock.symbol} data={performanceData} />
          <StockTabs stock={stock} />
        </div>

        {/* Right column: Key metrics and News */}
        <div>
          <StockMetrics stock={stock} />
          <StockNews news={stock.news} />
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
