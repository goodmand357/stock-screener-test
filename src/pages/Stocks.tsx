import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import StockDetail from '@/components/StockDetail';
import stockService, { StockData } from '@/services/stockService';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Stocks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data: stocks, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getStocks,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes to avoid API limits
    retry: 2,
    meta: {
      errorHandler: (error: Error) => {
        toast({
          title: "Error loading stocks",
          description: "Using cached data instead. " + error.message,
          variant: "destructive",
        });
      }
    },
    onSettled: (data, error) => {
      if (error) {
        toast({
          title: "Error loading stocks",
          description: "Using cached data instead. " + (error as Error).message,
          variant: "destructive",
        });
      }
    }
  });

  const handleStockSelect = async (stock: StockData) => {
    try {
      // Get latest data for the selected stock
      const updatedStock = await stockService.getStock(stock.symbol);
      setSelectedStock(updatedStock);
    } catch (error) {
      toast({
        title: "Error loading stock details",
        description: "Some data may not be current.",
        variant: "destructive",
      });
      setSelectedStock(stock);
    }
  };

  const handleBackClick = () => {
    setSelectedStock(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      // Manually trigger a search
      const results = await stockService.searchStocks(searchQuery);
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: `No stocks found matching "${searchQuery}"`,
        });
      } else if (results.length === 1) {
        // If only one result, go directly to that stock
        handleStockSelect(results[0]);
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const filteredStocks = stocks?.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalItems = filteredStocks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      if (startPage > 2) {
        pageNumbers.push(-1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push(-2);
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (selectedStock) {
    return (
      <div className="animate-fadeIn">
        <StockDetail stock={selectedStock} onBack={handleBackClick} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Stocks</h1>
        <p className="text-muted-foreground mt-1">Track and analyze stocks in real-time</p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Using Alpha Vantage API</AlertTitle>
        <AlertDescription>
          This application is using the Alpha Vantage API which has rate limits. 
          If stock data appears outdated or incomplete, the application will fallback to cached data.
        </AlertDescription>
      </Alert>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error loading stocks</AlertTitle>
            <AlertDescription>
              Using cached data instead. Please try again later.
              <button 
                onClick={() => refetch()}
                className="underline ml-2"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Market Cap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((stock) => (
                    <TableRow
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell className="text-muted-foreground">{stock.name}</TableCell>
                      <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                      <TableCell className={`text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        {' '}
                        ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{stock.volume}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{stock.marketCap}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No stocks found matching "{searchQuery}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredStocks.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} stocks
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={goToPrevPage} 
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((pageNumber, index) => (
                    <PaginationItem key={index}>
                      {pageNumber === -1 || pageNumber === -2 ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink 
                          isActive={pageNumber === currentPage}
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={goToNextPage} 
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Stocks;
