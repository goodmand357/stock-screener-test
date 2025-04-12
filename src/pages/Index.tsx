
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { fetchStockData } from '@/services/StockService';
import StockDetail from '@/components/StockDetail';

// Default stocks to show on initial load
const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    const loadInitialStocks = async () => {
      setLoading(true);
      try {
        const stocksData = await Promise.all(
          defaultSymbols.map(async (symbol) => {
            try {
              return await fetchStockData(symbol);
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              return null;
            }
          })
        );
        
        setStocks(stocksData.filter(Boolean));
      } catch (error) {
        console.error('Error loading initial stocks:', error);
        toast.error('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialStocks();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const stockData = await fetchStockData(searchQuery);
      if (stockData) {
        if (!stocks.some(stock => stock.ticker === stockData.ticker)) {
          setStocks([stockData, ...stocks]);
        }
        // Focus on the searched stock
        setSelectedStock(stockData);
      } else {
        toast.error(`No data found for ${searchQuery}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
  };

  const handleBackClick = () => {
    setSelectedStock(null);
  };

  const filteredStocks = stocks.filter(stock =>
    (stock.ticker || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a stock is selected, show the detailed view
  if (selectedStock) {
    return (
      <div className="animate-in fade-in duration-300">
        <StockDetail stock={selectedStock} onBack={handleBackClick} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Stock Data Oracle</h1>
        <p className="text-muted-foreground mt-1">Track and analyze stocks with data from multiple sources</p>
      </div>

      <div className="relative mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search by ticker symbol (e.g., AAPL, MSFT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {loading && stocks.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="table-container overflow-x-auto rounded-lg border border-border">
          <table className="stock-table w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Symbol</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sector/Industry</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">PE Ratio</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Market Cap</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Revenue Growth</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {searchQuery ? 'No matching stocks found' : 'No stocks available. Try searching for a ticker symbol.'}
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr
                    key={stock.ticker}
                    onClick={() => handleStockSelect(stock)}
                    className="cursor-pointer hover:bg-muted/50 border-b border-border transition-colors"
                  >
                    <td className="px-4 py-4 font-medium">{stock.ticker}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {stock.sector || 'N/A'} / {stock.industry || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      ${stock.price?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground">
                      {stock.pe_ratio ? stock.pe_ratio.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground">
                      {stock.market_cap ? formatMarketCap(stock.market_cap) : 'N/A'}
                    </td>
                    <td className={`px-4 py-4 text-right ${getGrowthColorClass(stock.revenue_growth_yoy)}`}>
                      {formatGrowth(stock.revenue_growth_yoy)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper functions for formatting
const formatMarketCap = (marketCap) => {
  if (!marketCap) return 'N/A';
  
  if (marketCap >= 1_000_000_000_000) {
    return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
  } else if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
};

const formatGrowth = (growth) => {
  if (growth === null || growth === undefined) return 'N/A';
  return `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
};

const getGrowthColorClass = (growth) => {
  if (growth === null || growth === undefined) return '';
  return growth >= 0 ? 'text-green-500' : 'text-red-500';
};

export default Index;
