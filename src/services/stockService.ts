import axios from 'axios';
import { generateMockStockData, generateMockStocks, formatMarketCap, formatVolume, formatRevenue } from '@/utils/stockUtils';

// Define stock data interface for type safety
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: string;
  revenue: string;
  nextReportDate?: string;
  rsi?: string;
  movingAverage50?: string;
  news?: { title: string; timeAgo: string }[];
  performanceData?: Array<{ year: string; value: number }>;
  // Additional fields based on your backend
  sector?: string;
  industry?: string;
  eps?: number;
  dividendYield?: number;
  netProfit?: string;
  epsGrowthYoy?: number;
  revenueGrowthYoy?: number;
  recommendation?: {
    buy: number;
    hold: number;
    sell: number;
    strongBuy: number;
    strongSell: number;
  };
  technicalIndicators?: {
    sma10?: number;
    rsi?: number;
    momentum?: number;
  };
}

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = "AYP563XKONIFZRIR";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Cache to store API responses and reduce API calls
const apiCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to check if cache is valid
const isCacheValid = (cacheKey: string): boolean => {
  if (!apiCache[cacheKey]) return false;
  return (Date.now() - apiCache[cacheKey].timestamp) < CACHE_DURATION;
};

// Helper to fetch data with caching
const fetchWithCache = async (url: string, params: Record<string, string>): Promise<any> => {
  const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;
  
  if (isCacheValid(cacheKey)) {
    console.log(`Using cached data for ${cacheKey}`);
    return apiCache[cacheKey].data;
  }
  
  try {
    console.log(`Fetching fresh data for ${cacheKey}`);
    const response = await axios.get(url, { params });
    
    // Check for API limit errors
    if (response.data && response.data.Note) {
      console.error("API call limit reached:", response.data.Note);
      throw new Error("API call limit reached, please try again later.");
    }
    
    // Save to cache
    apiCache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };
    
    return response.data;
  } catch (error: any) {
    console.error("API fetch error:", error.message);
    throw error;
  }
};

// Fetch company overview data from Alpha Vantage
const fetchCompanyOverview = async (symbol: string): Promise<any> => {
  return fetchWithCache(ALPHA_VANTAGE_BASE_URL, {
    function: 'OVERVIEW',
    symbol: symbol,
    apikey: ALPHA_VANTAGE_API_KEY
  });
};

// Fetch daily stock data from Alpha Vantage
const fetchDailyStockData = async (symbol: string): Promise<any> => {
  return fetchWithCache(ALPHA_VANTAGE_BASE_URL, {
    function: 'TIME_SERIES_DAILY',
    symbol: symbol,
    outputsize: 'compact',
    apikey: ALPHA_VANTAGE_API_KEY
  });
};

// Fetch global quote data from Alpha Vantage
const fetchGlobalQuote = async (symbol: string): Promise<any> => {
  return fetchWithCache(ALPHA_VANTAGE_BASE_URL, {
    function: 'GLOBAL_QUOTE',
    symbol: symbol,
    apikey: ALPHA_VANTAGE_API_KEY
  });
};

// Fetch symbol search results from Alpha Vantage
const fetchSymbolSearch = async (keywords: string): Promise<any> => {
  return fetchWithCache(ALPHA_VANTAGE_BASE_URL, {
    function: 'SYMBOL_SEARCH',
    keywords: keywords,
    apikey: ALPHA_VANTAGE_API_KEY
  });
};

// Map Alpha Vantage data to our StockData interface
const mapAlphaVantageToStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Fetch data from multiple endpoints
    const [overview, quote, dailyData] = await Promise.all([
      fetchCompanyOverview(symbol),
      fetchGlobalQuote(symbol),
      fetchDailyStockData(symbol)
    ]);
    
    const globalQuote = quote["Global Quote"];
    
    if (!globalQuote || !overview) {
      throw new Error("Incomplete data received");
    }
    
    // Extract performance data from time series if available
    let performanceData: { year: string; value: number }[] = [];
    if (dailyData && dailyData["Time Series (Daily)"]) {
      const timeSeries = dailyData["Time Series (Daily)"];
      performanceData = Object.keys(timeSeries)
        .slice(0, 30) // Last 30 days
        .reverse()
        .map(date => ({
          year: date,
          value: parseFloat(timeSeries[date]["4. close"])
        }));
    }
    
    // Calculate price change
    const price = parseFloat(globalQuote["05. price"]);
    const prevClose = parseFloat(globalQuote["08. previous close"]);
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    // Basic news (could be enhanced with a news API)
    const news = [
      { title: `${overview.Name} reports quarterly earnings`, timeAgo: "2 days ago" },
      { title: `Market analysis for ${overview.Sector} sector`, timeAgo: "3 days ago" },
      { title: `Industry outlook: ${overview.Industry}`, timeAgo: "5 days ago" }
    ];
    
    // Return mapped stock data
    return {
      symbol: overview.Symbol || symbol,
      name: overview.Name || symbol,
      price: price,
      change: change,
      changePercent: changePercent,
      volume: formatVolume(parseInt(globalQuote["06. volume"] || "0")),
      marketCap: formatMarketCap(parseFloat(overview.MarketCapitalization || "0")),
      peRatio: overview.PERatio || "N/A",
      revenue: formatRevenue(parseFloat(overview.Revenue || "0")),
      sector: overview.Sector,
      industry: overview.Industry,
      eps: parseFloat(overview.EPS || "0"),
      dividendYield: parseFloat(overview.DividendYield || "0"),
      netProfit: formatRevenue(parseFloat(overview.ProfitMargin || "0") * parseFloat(overview.Revenue || "0")),
      epsGrowthYoy: parseFloat(overview.EpsGrowthYOY || "0"),
      revenueGrowthYoy: parseFloat(overview.QuarterlyRevenueGrowthYOY || "0"),
      nextReportDate: overview.NextEarningsDate || undefined,
      rsi: "N/A", // Would need additional API calls for technical indicators
      movingAverage50: "N/A",
      performanceData: performanceData,
      news: news,
      technicalIndicators: {
        sma10: 0,
        rsi: 0,
        momentum: 0
      }
    };
  } catch (error) {
    console.error(`Error mapping ${symbol} data:`, error);
    // Fall back to mock data if API fails
    return generateMockStockData(symbol);
  }
};

// LocalStorage keys for caching
const STOCKS_KEY = 'stocks_data';
const LAST_UPDATE_KEY = 'stocks_last_update';

// Fallback to mock data if API calls fail
const localStockService = {
  // ... keep existing code for initialize, saveStocks, getStocks, getStock, searchStocks, etc.
  
  // Initialize with mock data if no data exists
  initialize: () => {
    if (!localStorage.getItem(STOCKS_KEY)) {
      const mockStocks = generateMockStocks();
      localStorage.setItem(STOCKS_KEY, JSON.stringify(mockStocks));
      localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
      console.log('Initialized local stock storage with mock data');
    }
  },
  
  // Save stocks to localStorage
  saveStocks: (stocks: StockData[]) => {
    localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks));
    localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
    console.log('Saved stocks to local storage');
  },
  
  // Get all stocks from localStorage
  getStocks: () => {
    localStockService.initialize();
    const stocksJson = localStorage.getItem(STOCKS_KEY);
    return stocksJson ? JSON.parse(stocksJson) as StockData[] : [];
  },
  
  // Get a specific stock by symbol
  getStock: (symbol: string) => {
    localStockService.initialize();
    const stocks = localStockService.getStocks();
    const stock = stocks.find(s => s.symbol === symbol);
    return stock || generateMockStockData(symbol);
  },
  
  // Search stocks by query
  searchStocks: (query: string) => {
    localStockService.initialize();
    const stocks = localStockService.getStocks();
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  // Check if stocks data needs to be refreshed
  shouldRefreshData: () => {
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
    if (!lastUpdate) return true;
    
    // Refresh every 30 minutes
    const thirtyMinutes = 30 * 60 * 1000;
    return (Date.now() - parseInt(lastUpdate)) > thirtyMinutes;
  },
  
  // Refresh stock data
  refreshStocks: () => {
    // ... keep existing code (function that refreshes mock stock data)
    if (localStockService.shouldRefreshData()) {
      console.log('Refreshing stock data with updated prices');
      const stocks = localStockService.getStocks();
      
      // Update prices and changes
      const updatedStocks = stocks.map(stock => {
        const changePercent = (Math.random() * 6) - 3; // -3% to +3%
        const oldPrice = stock.price;
        const change = (oldPrice * changePercent / 100);
        const newPrice = oldPrice + change;
        
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          // Update time on news
          news: stock.news?.map(item => ({
            ...item, 
            timeAgo: localStockService.updateTimeAgo(item.timeAgo)
          }))
        };
      });
      
      localStockService.saveStocks(updatedStocks);
      return updatedStocks;
    }
    
    return localStockService.getStocks();
  },
  
  // Helper to update "time ago" strings
  updateTimeAgo: (timeAgo: string) => {
    // Extract the number and unit
    const match = timeAgo.match(/(\d+)\s+(\w+)/);
    if (!match) return timeAgo;
    
    let [_, number, unit] = match;
    const num = parseInt(number);
    
    // Simple update logic - could be more sophisticated
    if (unit.includes('day')) {
      if (num > 1) return `${num + 1} days ago`;
      return '2 days ago';
    } else if (unit.includes('hour')) {
      if (num >= 23) return '1 day ago';
      return `${num + 1} hours ago`;
    }
    
    return timeAgo;
  }
};

// Default popular stock symbols for initial loading
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];

// Improved stock service now using real API data with localStorage caching
const stockService = {
  // Get all stocks
  getStocks: async (): Promise<StockData[]> => {
    console.log('Fetching all stocks');
    try {
      // Check if we have cached stocks
      if (localStockService.shouldRefreshData()) {
        console.log('Cache expired, fetching fresh stock data from API');
        
        // Fetch data for default stocks
        const fetchPromises = DEFAULT_SYMBOLS.map(symbol => 
          mapAlphaVantageToStockData(symbol)
            .catch(error => {
              console.error(`Error fetching ${symbol}:`, error);
              return generateMockStockData(symbol);
            })
        );
        
        // Wait for all API calls to complete
        const stocks = await Promise.all(fetchPromises);
        
        // Cache the results
        localStockService.saveStocks(stocks);
        return stocks;
      } else {
        console.log('Using cached stock data');
        return localStockService.getStocks();
      }
    } catch (error: any) {
      console.error('Error fetching stocks:', error.message);
      // Fallback to mock data
      return localStockService.refreshStocks();
    }
  },
  
  // Get a specific stock by symbol
  getStock: async (symbol: string): Promise<StockData> => {
    console.log(`Fetching stock ${symbol}`);
    try {
      // Try to get real data
      return await mapAlphaVantageToStockData(symbol);
    } catch (error: any) {
      console.error(`Error fetching stock ${symbol}:`, error.message);
      // Fallback to localStorage or mock data
      return localStockService.getStock(symbol);
    }
  },
  
  // Search stocks by query
  searchStocks: async (query: string): Promise<StockData[]> => {
    console.log('Searching stocks with query:', query);
    try {
      // Use Alpha Vantage's symbol search
      const searchResults = await fetchSymbolSearch(query);
      
      if (searchResults.bestMatches && searchResults.bestMatches.length > 0) {
        // Get top 5 matches
        const topMatches = searchResults.bestMatches.slice(0, 5);
        
        // Fetch detailed data for each match
        const stockPromises = topMatches.map((match: any) => 
          mapAlphaVantageToStockData(match["1. symbol"])
            .catch(error => {
              console.error(`Error fetching ${match["1. symbol"]}:`, error);
              return generateMockStockData(match["1. symbol"]);
            })
        );
        
        return await Promise.all(stockPromises);
      }
      
      // Fallback to local search if API call fails or returns no results
      return localStockService.searchStocks(query);
    } catch (error: any) {
      console.error('Error searching stocks:', error.message);
      return localStockService.searchStocks(query);
    }
  }
};

export default stockService;

