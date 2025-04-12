import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, CircleDollarSign, ChartBar, Calendar, Info, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { formatMarketCap } from '@/utils/formatters';

// Default sample chart data
const generateRandomPriceData = (basePrice, count = 30) => {
  const data = [];
  let currentPrice = basePrice;
  
  const today = new Date();
  
  for (let i = count; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * basePrice * 0.03;
    currentPrice += change;
    currentPrice = Math.max(currentPrice, basePrice * 0.7);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: currentPrice
    });
  }
  
  return data;
};

const StockDetail = ({ stock, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Generate chart data based on stock price
  const priceData = generateRandomPriceData(stock.price || 100);
  
  // Growth data for bar chart
  const growthData = [
    { name: 'Revenue', value: stock.revenue_growth_yoy || 0 },
    { name: 'EPS', value: stock.eps_growth_yoy || 0 },
    { name: 'Y1', value: stock.revenue_growth_y1 || 0 },
    { name: 'Y2', value: stock.revenue_growth_y2 || 0 },
    { name: 'Y3', value: stock.revenue_growth_y3 || 0 }
  ];
  
  const isPricePositive = stock.price !== null && stock.price > 0;

  return (
    <div className="container mx-auto py-6 px-4">
      <Button variant="ghost" size="sm" className="mb-4" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Stocks
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{stock.ticker}</h1>
          <p className="text-muted-foreground">{stock.sector} / {stock.industry}</p>
        </div>
        
        <div className="flex items-center">
          <span className="text-3xl font-bold mr-2">${stock.price?.toFixed(2) || 'N/A'}</span>
          {isPricePositive && (
            <span className="flex items-center text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
            </span>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CircleDollarSign className="h-4 w-4 mr-2" />
                  Market Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Market Cap</dt>
                    <dd className="text-sm font-medium">{formatMarketCap(stock.market_cap)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">P/E Ratio</dt>
                    <dd className="text-sm font-medium">{stock.pe_ratio?.toFixed(2) || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">EPS</dt>
                    <dd className="text-sm font-medium">${stock.eps?.toFixed(2) || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Dividend Yield</dt>
                    <dd className="text-sm font-medium">
                      {stock.dividend_yield ? `${(stock.dividend_yield * 100).toFixed(2)}%` : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ChartBar className="h-4 w-4 mr-2" />
                  Financial Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Revenue</dt>
                    <dd className="text-sm font-medium">{formatMarketCap(stock.revenue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Net Profit</dt>
                    <dd className="text-sm font-medium">{formatMarketCap(stock.net_profit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Revenue Growth</dt>
                    <dd className={`text-sm font-medium ${stock.revenue_growth_yoy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.revenue_growth_yoy !== null && stock.revenue_growth_yoy !== undefined
                        ? `${stock.revenue_growth_yoy >= 0 ? '+' : ''}${stock.revenue_growth_yoy.toFixed(2)}%`
                        : 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">EPS Growth</dt>
                    <dd className={`text-sm font-medium ${stock.eps_growth_yoy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.eps_growth_yoy !== null && stock.eps_growth_yoy !== undefined
                        ? `${stock.eps_growth_yoy >= 0 ? '+' : ''}${stock.eps_growth_yoy.toFixed(2)}%`
                        : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Technical Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">SMA (10-day)</dt>
                    <dd className="text-sm font-medium">${stock.sma_10?.toFixed(2) || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">RSI</dt>
                    <dd className="text-sm font-medium">{stock.rsi?.toFixed(2) || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Momentum</dt>
                    <dd className="text-sm font-medium">{stock.momentum?.toFixed(2) || 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>30-day price trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => tick.slice(5)} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(tick) => `$${tick.toFixed(0)}`}
                      tick={{ fontSize: 12 }} 
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & EPS Growth</CardTitle>
              <CardDescription>Year-over-year growth rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(tick) => `${tick}%`} />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Growth']} />
                    <Bar 
                      dataKey="value" 
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Revenue</dt>
                    <dd className="text-sm font-medium">{formatMarketCap(stock.revenue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Net Income</dt>
                    <dd className="text-sm font-medium">{formatMarketCap(stock.net_profit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">EPS</dt>
                    <dd className="text-sm font-medium">${stock.eps?.toFixed(2) || 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Financial Ratios</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">P/E Ratio</dt>
                    <dd className="text-sm font-medium">{stock.pe_ratio?.toFixed(2) || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Dividend Yield</dt>
                    <dd className="text-sm font-medium">
                      {stock.dividend_yield ? `${(stock.dividend_yield * 100).toFixed(2)}%` : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>RSI</CardTitle>
                <CardDescription>
                  {getRSIDescription(stock.rsi)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-4xl font-bold">{stock.rsi?.toFixed(1) || 'N/A'}</div>
                </div>
                {stock.rsi && (
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getRSIColorClass(stock.rsi)}`} 
                      style={{ width: `${Math.min(100, Math.max(0, stock.rsi))}%` }}
                    ></div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Moving Average</CardTitle>
                <CardDescription>10-day Simple Moving Average</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-4xl font-bold">${stock.sma_10?.toFixed(2) || 'N/A'}</div>
                </div>
                {stock.sma_10 && stock.price && (
                  <div className="mt-4 text-center">
                    <span className={stock.price > stock.sma_10 ? 'text-green-500' : 'text-red-500'}>
                      {stock.price > stock.sma_10 
                        ? <div className="flex items-center justify-center"><ArrowUpRight className="h-4 w-4 mr-1" /> Above MA</div>
                        : <div className="flex items-center justify-center"><TrendingDown className="h-4 w-4 mr-1" /> Below MA</div>
                      }
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Momentum</CardTitle>
                <CardDescription>Price momentum indicator</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-4xl font-bold">{stock.momentum?.toFixed(2) || 'N/A'}</div>
                </div>
                {stock.momentum && (
                  <div className="mt-4 text-center">
                    <span className={stock.momentum > 0 ? 'text-green-500' : 'text-red-500'}>
                      {stock.momentum > 0 
                        ? <div className="flex items-center justify-center"><TrendingUp className="h-4 w-4 mr-1" /> Positive</div>
                        : <div className="flex items-center justify-center"><TrendingDown className="h-4 w-4 mr-1" /> Negative</div>
                      }
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper functions for technical indicators
const getRSIDescription = (rsi) => {
  if (!rsi) return 'Relative Strength Index';
  if (rsi > 70) return 'Overbought territory (>70)';
  if (rsi < 30) return 'Oversold territory (<30)';
  return 'Neutral territory (30-70)';
};

const getRSIColorClass = (rsi) => {
  if (rsi > 70) return 'bg-red-500';
  if (rsi < 30) return 'bg-green-500';
  return 'bg-blue-500';
};

export default StockDetail;
