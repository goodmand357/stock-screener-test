
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import StockDetail from './StockDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getStocks, searchStocks, Stock } from '@/services/stockService';

const Stocks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch stocks on component mount
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const data = await getStocks();
        setStocks(data);
      } catch (error) {
        console.error('Failed to load stocks:', error);
        toast({
          title: "Error",
          description: "Failed to load stocks. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const results = await searchStocks(searchQuery);
          setStocks(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else if (searchQuery.length === 0 && stocks.length === 0) {
        const data = await getStocks();
        setStocks(data);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
  };

  const handleBackClick = () => {
    setSelectedStock(null);
  };

  // If a stock is selected, show the detailed view
  if (selectedStock) {
    return (
      <div className="animate-fadeIn">
        <StockDetail stock={selectedStock} onBack={handleBackClick} />
      </div>
    );
  }

  // Main stocks list view
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Stocks</h1>
        <p className="text-muted-foreground mt-1">Track and analyze stocks</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-muted rounded-full mb-4"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
        </div>
      ) : stocks.length > 0 ? (
        <div className="table-container overflow-x-auto">
          <table className="stock-table w-full rounded-lg overflow-hidden">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Symbol</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Change</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Volume</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  className="cursor-pointer hover:bg-muted/50 border-b border-border transition-colors"
                >
                  <td className="px-4 py-4 font-medium">{stock.symbol}</td>
                  <td className="px-4 py-4 text-muted-foreground">{stock.name}</td>
                  <td className="px-4 py-4 text-right">${stock.price?.toFixed(2) || 'N/A'}</td>
                  <td className={`px-4 py-4 text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change !== undefined ? (
                      <>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        {' '}
                        ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </>
                    ) : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-right text-muted-foreground">{stock.volume}</td>
                  <td className="px-4 py-4 text-right text-muted-foreground">{stock.marketCap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-card">
          <p className="text-muted-foreground">No stocks found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Stocks;
