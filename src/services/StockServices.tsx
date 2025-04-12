 // This file provides a mock service that simulates fetching stock data
 // In a real application, this would call the backend API
 
 // Simulate network delay
 const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
 
 // Random data generator for testing purposes
 const generateRandomPrice = (base = 100) => base + (Math.random() - 0.5) * base * 0.1;
 const generateRandomGrowth = () => (Math.random() - 0.3) * 40;
 const generateRandomRatio = (min, max) => min + Math.random() * (max - min);
 
 // Convert API response format to our application format
 const transformStockData = (apiData) => {
   // In a real app, this would transform the API response to match our frontend data model
   // For now, we'll just return the mock data directly
   return apiData;
 };
 
 // Mock implementation that would make real API calls in production
 export const fetchStockData = async (symbol) => {
   // Simulate network request
   await delay(1000);
   
   try {
     // In a real app, this would be a fetch call to your backend
     // For example: const response = await fetch(`/api/stocks/${symbol}`);
     
     // For demo purposes, we'll generate mock data
     const mockData = {
       ticker: symbol.toUpperCase(),
       price: generateRandomPrice(100),
       pe_ratio: generateRandomRatio(10, 40),
       eps: generateRandomRatio(1, 15),
       dividend_yield: Math.random() * 0.05,
       sector: getRandomSector(),
       industry: getRandomIndustry(),
       market_cap: Math.random() * 1000000000000,
       revenue: Math.random() * 100000000000,
       net_profit: Math.random() * 30000000000,
       eps_growth_yoy: generateRandomGrowth(),
       revenue_growth_yoy: generateRandomGrowth(),
       revenue_growth_y1: generateRandomGrowth(),
       revenue_growth_y2: generateRandomGrowth(),
       revenue_growth_y3: generateRandomGrowth(),
       sma_10: generateRandomPrice(95),
       rsi: Math.random() * 100,
       momentum: (Math.random() - 0.5) * 10,
     };
     
     // Transform the API response to match our application's expected format
     return transformStockData(mockData);
   } catch (error) {
     console.error("Error fetching stock data:", error);
     throw new Error("Failed to fetch stock data");
   }
 };
 
 // Helper functions to generate random sectors and industries
 const getRandomSector = () => {
   const sectors = [
     "Technology", 
     "Healthcare", 
     "Financial Services", 
     "Consumer Cyclical", 
     "Communication Services",
     "Industrial",
     "Energy"
   ];
   return sectors[Math.floor(Math.random() * sectors.length)];
 };
 
 const getRandomIndustry = () => {
   const industries = [
     "Software", 
     "Semiconductors", 
     "Biotechnology", 
     "Banking", 
     "Insurance",
     "Retail",
     "Telecommunications",
     "Automotive",
     "Oil & Gas"
   ];
   return industries[Math.floor(Math.random() * industries.length)];
 };
