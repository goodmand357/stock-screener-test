
export const getPerformanceData = (symbol: string) => [
  { year: '2019', value: 100 },
  { year: '2020', value: 120 },
  { year: '2021', value: 180 },
  { year: '2022', value: 150 },
  { year: '2023', value: 200 },
  { year: '2024', value: 220 },
];

// Format numbers for display
export const formatMarketCap = (marketCap: number) => {
  if (marketCap >= 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `${marketCap.toFixed(2)}`;
  }
};

export const formatVolume = (volume: number) => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
};

export const formatRevenue = (revenue: number) => {
  if (revenue >= 1e9) {
    return `$${(revenue / 1e9).toFixed(1)}B`;
  } else if (revenue >= 1e6) {
    return `$${(revenue / 1e6).toFixed(1)}M`;
  } else {
    return `$${revenue.toFixed(2)}`;
  }
};

export const formatGrowth = (growthValue: number | undefined) => {
  if (growthValue === undefined || growthValue === null) return 'N/A';
  
  return `${growthValue >= 0 ? '+' : ''}${growthValue.toFixed(2)}%`;
};

export const formatRecommendation = (recommendation: any) => {
  if (!recommendation) return 'N/A';
  
  const total = recommendation.buy + recommendation.sell + 
                recommendation.hold + recommendation.strongBuy + 
                recommendation.strongSell;
  
  if (total === 0) return 'N/A';
  
  const buyRatio = ((recommendation.buy + recommendation.strongBuy) / total * 100).toFixed(0);
  return `${buyRatio}% Buy`;
};
