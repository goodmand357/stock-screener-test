/**
 * Formats a market cap value to human-readable format
 * @param marketCap - Market capitalization value
 * @returns Formatted market cap string
 */
export const formatMarketCap = (marketCap: number | null | undefined): string => {
  if (marketCap === null || marketCap === undefined) return 'N/A';
  
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

/**
 * Formats a growth percentage with + or - sign
 * @param growth - Growth value in percentage
 * @returns Formatted growth string
 */
export const formatGrowth = (growth: number | null | undefined): string => {
  if (growth === null || growth === undefined) return 'N/A';
  return `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
};

/**
 * Returns a CSS class based on growth value
 * @param growth - Growth value in percentage
 * @returns CSS class name for styling
 */
export const getGrowthColorClass = (growth: number | null | undefined): string => {
  if (growth === null || growth === undefined) return '';
  return growth >= 0 ? 'text-green-500' : 'text-red-500';
};
