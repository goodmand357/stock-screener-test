
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewsItem {
  title: string;
  timeAgo: string;
}

interface StockNewsProps {
  news?: NewsItem[];
}

const StockNews: React.FC<StockNewsProps> = ({ news }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        {news && news.length > 0 ? (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.timeAgo}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No recent news available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StockNews;
