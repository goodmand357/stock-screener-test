
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import StockDetail from '@/components/StockDetail';
import stockService, { StockData } from '@/services/stockService';
import { useQuery } from '@tanstack/react-query';

const Stocks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch all stocks on initial load
  const { data: stocks, isLoading, error } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getStocks,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Could not fetch stocks. Using cached data.",
          variant: "destructive",
        });
      }
    },
  });

  // Handle stock selection
  const handleStockSelect = (stock: StockData) => {
    setSelectedStock(stock);
  };

  // Handle back button click
  const handleBackClick = () => {
    setSelectedStock(null);
  };

  // Filter stocks based on search query
  const filteredStocks = stocks?.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
    <div className="animate-fadeIn p-6">
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

      {isLoading ? (
        <div className="text-center py-10">Loading stocks...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Error loading stocks. Using cached data.
        </div>
      ) : (
        <div className="table-container overflow-x-auto rounded-lg border border-border">
          <table className="stock-table w-full">
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
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <tr
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock)}
                    className="cursor-pointer hover:bg-muted/50 border-b border-border transition-colors"
                  >
                    <td className="px-4 py-4 font-medium">{stock.symbol}</td>
                    <td className="px-4 py-4 text-muted-foreground">{stock.name}</td>
                    <td className="px-4 py-4 text-right">${stock.price.toFixed(2)}</td>
                    <td className={`px-4 py-4 text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      {' '}
                      ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground">{stock.volume}</td>
                    <td className="px-4 py-4 text-right text-muted-foreground">{stock.marketCap}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No stocks found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stocks;
