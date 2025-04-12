
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockData } from '@/services/stockService';

interface StockFinancialsProps {
  stock: StockData;
}

const StockFinancials: React.FC<StockFinancialsProps> = ({ stock }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">RSI</p>
            <p>{stock.rsi || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">50-Day MA</p>
            <p>{stock.movingAverage50 || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Next Report</p>
            <p>{stock.nextReportDate || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockFinancials;
