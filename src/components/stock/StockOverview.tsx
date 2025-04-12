
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockData } from '@/services/stockService';

interface StockOverviewProps {
  stock: StockData;
}

const StockOverview: React.FC<StockOverviewProps> = ({ stock }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
            <p>{stock.marketCap}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">P/E Ratio</p>
            <p>{stock.peRatio}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Volume</p>
            <p>{stock.volume}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Revenue</p>
            <p>{stock.revenue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockOverview;
