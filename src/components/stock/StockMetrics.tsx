
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockData } from '@/services/stockService';

interface StockMetricsProps {
  stock: StockData;
}

const StockMetrics: React.FC<StockMetricsProps> = ({ stock }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
            <p className="text-lg font-medium">{stock.marketCap}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">P/E Ratio</p>
            <p className="text-lg font-medium">{stock.peRatio}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Volume</p>
            <p className="text-lg font-medium">{stock.volume}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Revenue</p>
            <p className="text-lg font-medium">{stock.revenue}</p>
          </div>
          {stock.nextReportDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Next Earnings</p>
              <p className="text-lg font-medium">{stock.nextReportDate}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockMetrics;
