
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockData } from '@/services/stockService';
import StockOverview from './StockOverview';
import StockFinancials from './StockFinancials';
import StockNews from './StockNews';

interface StockTabsProps {
  stock: StockData;
}

const StockTabs: React.FC<StockTabsProps> = ({ stock }) => {
  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="news">News</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <StockOverview stock={stock} />
      </TabsContent>
      
      <TabsContent value="financials">
        <StockFinancials stock={stock} />
      </TabsContent>
      
      <TabsContent value="news">
        <StockNews news={stock.news} />
      </TabsContent>
    </Tabs>
  );
};

export default StockTabs;
