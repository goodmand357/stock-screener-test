
import axios from 'axios';

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

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Stock service functions
const stockService = {
  // Get all stocks
  getStocks: async (): Promise<StockData[]> => {
    try {
      const response = await axios.get(`${API_URL}/stocks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  },
  
  // Get a specific stock by symbol
  getStock: async (symbol: string): Promise<StockData> => {
    try {
      const response = await axios.get(`${API_URL}/stocks/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      throw error;
    }
  },
  
  // Search stocks by query
  searchStocks: async (query: string): Promise<StockData[]> => {
    try {
      const response = await axios.get(`${API_URL}/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }
};

export default stockService;
