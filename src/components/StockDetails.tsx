
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockNews {
  title: string;
  timeAgo: string;
}

interface Stock {
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

interface StockDetailProps {
  stock: Stock;
  onBack: () => void;
}

const defaultPerformanceData = [
  { year: '2019', value: 100 },
  { year: '2020', value: 120 },
  { year: '2021', value: 180 },
  { year: '2022', value: 150 },
  { year: '2023', value: 200 },
];

const StockDetail: React.FC<StockDetailProps> = ({ stock, onBack }) => {
  const chartData = stock.performanceData || defaultPerformanceData;

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="mr-3 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Back to stocks list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">{stock.symbol}</h1>
          <p className="text-muted-foreground">{stock.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm mb-1">Current Price</div>
          <div className="text-3xl font-bold">${stock.price.toFixed(2)}</div>
          <div className={`flex items-center ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
            {' '}
            ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm mb-1">Market Cap</div>
          <div className="text-2xl font-bold">{stock.marketCap}</div>
          <div className="text-muted-foreground text-sm">Volume: {stock.volume}</div>
        </div>

        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm mb-1">Key Metrics</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-muted-foreground">P/E Ratio</div>
              <div className="font-semibold">{stock.peRatio || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Revenue</div>
              <div className="font-semibold">{stock.revenue || 'N/A'}</div>
            </div>
            {stock.rsi && (
              <div>
                <div className="text-sm text-muted-foreground">RSI</div>
                <div className="font-semibold">{stock.rsi}</div>
              </div>
            )}
            {stock.movingAverage50 && (
              <div>
                <div className="text-sm text-muted-foreground">50-Day MA</div>
                <div className="font-semibold">{stock.movingAverage50}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="chart" className="mb-8">
        <TabsList>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent News</h3>
            <div className="space-y-4">
              {stock.news && stock.news.map((item, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.timeAgo}</p>
                </div>
              ))}
              {(!stock.news || stock.news.length === 0) && (
                <p className="text-muted-foreground">No recent news available</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-muted-foreground">Market Cap</td>
                  <td className="py-2 text-right font-medium">{stock.marketCap}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-muted-foreground">P/E Ratio</td>
                  <td className="py-2 text-right font-medium">{stock.peRatio || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-muted-foreground">Revenue</td>
                  <td className="py-2 text-right font-medium">{stock.revenue || 'N/A'}</td>
                </tr>
                {stock.nextReportDate && (
                <tr className="border-b">
                  <td className="py-2 text-muted-foreground">Next Report</td>
                  <td className="py-2 text-right font-medium">{stock.nextReportDate}</td>
                </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockDetail;
