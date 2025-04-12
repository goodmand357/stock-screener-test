
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface StockNews {
  title: string;
  timeAgo: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: string | number;
  revenue: string;
  nextReportDate?: string;
  rsi?: string;
  movingAverage50?: string;
  news: StockNews[];
  performanceData?: any[];
}

export const getStocks = async (): Promise<Stock[]> => {
  try {
    const response = await axios.get(`${API_URL}/stocks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    // Return mock data as fallback
    return getMockStocks();
  }
};

export const getStock = async (symbol: string): Promise<Stock> => {
  try {
    const response = await axios.get(`${API_URL}/stocks/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error);
    // Return mock data as fallback
    const mockStock = getMockStocks().find(stock => stock.symbol === symbol);
    return mockStock || getMockStocks()[0];
  }
};

export const searchStocks = async (query: string): Promise<Stock[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching stocks:', error);
    // Filter mock data as fallback
    const mockStocks = getMockStocks();
    return mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Mock data as fallback when API is not available
const getMockStocks = (): Stock[] => {
  return [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.68,
      change: 1.23,
      changePercent: 0.67,
      volume: "52.4M",
      marketCap: "2.89T",
      peRatio: "28.5",
      revenue: "$394.3B",
      nextReportDate: "Apr 25, 2024",
      rsi: "56.78",
      movingAverage50: "$178.45",
      news: [
        {
          title: 'Apple Announces New Product Line',
          timeAgo: '2 hours ago'
        },
        {
          title: 'Q1 Earnings Beat Expectations',
          timeAgo: '1 day ago'
        }
      ],
      performanceData: [
        { year: '2019', value: 100 },
        { year: '2020', value: 120 },
        { year: '2021', value: 180 },
        { year: '2022', value: 150 },
        { year: '2023', value: 200 },
      ]
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 328.79,
      change: 4.23,
      changePercent: 1.30,
      volume: "35.2M",
      marketCap: "2.45T",
      peRatio: "32.1",
      revenue: "$211.9B",
      nextReportDate: "May 2, 2024",
      rsi: "62.34",
      movingAverage50: "$315.21",
      news: [
        {
          title: 'Microsoft Cloud Revenue Surges',
          timeAgo: '5 hours ago'
        },
        {
          title: 'New AI Features Announced for Office Suite',
          timeAgo: '3 days ago'
        }
      ],
      performanceData: [
        { year: '2019', value: 120 },
        { year: '2020', value: 140 },
        { year: '2021', value: 210 },
        { year: '2022', value: 180 },
        { year: '2023', value: 250 },
      ]
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 134.99,
      change: -0.98,
      changePercent: -0.72,
      volume: "28.1M",
      marketCap: "1.70T",
      peRatio: "25.7",
      revenue: "$307.4B",
      nextReportDate: "May 10, 2024",
      rsi: "48.92",
      movingAverage50: "$138.75",
      news: [
        {
          title: 'Google Search Updates Algorithm',
          timeAgo: '1 day ago'
        },
        {
          title: 'YouTube Premium Subscribers Reach New Milestone',
          timeAgo: '4 days ago'
        }
      ],
      performanceData: [
        { year: '2019', value: 110 },
        { year: '2020', value: 130 },
        { year: '2021', value: 170 },
        { year: '2022', value: 140 },
        { year: '2023', value: 190 },
      ]
    }
  ];
};
