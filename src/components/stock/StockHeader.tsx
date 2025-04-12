
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface StockHeaderProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  onBack: () => void;
}

const StockHeader: React.FC<StockHeaderProps> = ({ 
  symbol, 
  name, 
  price, 
  change, 
  changePercent, 
  onBack 
}) => {
  return (
    <div className="flex items-center mb-6">
      <button 
        onClick={onBack}
        className="mr-3 flex items-center justify-center rounded-full w-8 h-8 bg-muted hover:bg-muted/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          {name} <span className="ml-2 text-lg font-medium text-muted-foreground">({symbol})</span>
        </h1>
        <div className="flex items-center mt-1">
          <span className="text-xl font-semibold">${price.toFixed(2)}</span>
          <span className={`ml-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockHeader;
