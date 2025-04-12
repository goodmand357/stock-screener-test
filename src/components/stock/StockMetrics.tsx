
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockData } from '@/services/stockService';

interface StockMetricsProps {
  stock: StockData;
  isLoading?: boolean;
}

const StockMetrics: React.FC<StockMetricsProps> = ({ stock, isLoading }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ) : (
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
            {stock.sector && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Sector</p>
                <p className="text-lg font-medium">{stock.sector}</p>
              </div>
            )}
            {stock.industry && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="text-lg font-medium">{stock.industry}</p>
              </div>
            )}
            {stock.eps !== undefined && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">EPS</p>
                <p className="text-lg font-medium">${stock.eps?.toFixed(2)}</p>
              </div>
            )}
            {stock.dividendYield !== undefined && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Dividend Yield</p>
                <p className="text-lg font-medium">{(stock.dividendYield * 100).toFixed(2)}%</p>
              </div>
            )}
            {stock.nextReportDate && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Next Earnings</p>
                <p className="text-lg font-medium">{stock.nextReportDate}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMetrics;
