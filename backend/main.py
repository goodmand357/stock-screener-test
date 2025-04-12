import os
import json
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from yahooquery import Ticker
from config import (
    ALPHA_VANTAGE_API_KEY,
    FINNHUB_API_KEY,
    ALPHA_VANTAGE_BASE_URL,
    FINNHUB_BASE_URL,
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_price_from_alpha_vantage(symbol):
    """Get current price from Alpha Vantage."""
    url = f"{ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
    response = requests.get(url)
    data = response.json()
    try:
        return float(data["Global Quote"]["05. price"])
    except (KeyError, TypeError):
        return None

def get_financial_data(symbol):
    """Fetch financial data from Yahoo Finance, fallback to Alpha Vantage for price."""
    symbol = symbol.upper()
    stock = Ticker(symbol)

    # Use get_modules to fetch detailed info
    modules = stock.get_modules(["summaryDetail", "assetProfile"])
    
    module_data = modules.get(symbol) or modules.get(symbol.upper()) or {}
    summary = module_data.get("summaryDetail", {})
    profile = module_data.get("assetProfile", {})

    # Income statement (trailing)
    income_stmt = stock.income_statement(trailing=True)

    # Extract financials
    result = {
        "symbol": symbol,
        "name": profile.get("longName", ""),
        "price": summary.get("regularMarketPrice"),
        "change": summary.get("regularMarketChange"),
        "changePercent": summary.get("regularMarketChangePercent"),
        "volume": summary.get("regularMarketVolume"),
        "marketCap": summary.get("marketCap"),
        "peRatio": summary.get("trailingPE"),
        "revenue": None,
        "sector": profile.get("sector"),
        "industry": profile.get("industry"),
        "nextReportDate": "",  # This usually requires a different API
        "rsi": None,  # This requires technical analysis calculation
        "movingAverage50": summary.get("fiftyDayAverage"),
    }

    # Format values for display
    if result["marketCap"]:
        result["marketCap"] = format_market_cap(result["marketCap"])
    if result["volume"]:
        result["volume"] = format_volume(result["volume"])
    
    # Format percentages and numbers
    if result["change"] is not None:
        result["change"] = round(result["change"], 2)
    if result["changePercent"] is not None:
        result["changePercent"] = round(result["changePercent"], 2)

    # Handle pandas DataFrame (income statement)
    if not isinstance(income_stmt, str) and not income_stmt.empty:
        if "TotalRevenue" in income_stmt.columns:
            revenue = income_stmt["TotalRevenue"].iloc[0]
            result["revenue"] = format_revenue(revenue)

    # Fallback for price
    if result["price"] is None:
        result["price"] = get_price_from_alpha_vantage(symbol)

    # Get news for the stock
    result["news"] = get_news_for_stock(symbol)

    return result

def get_news_for_stock(symbol):
    """Get news articles for a stock symbol."""
    try:
        today = datetime.now()
        one_week_ago = today - timedelta(days=7)
        
        url = f"{FINNHUB_BASE_URL}/company-news"
        params = {
            "symbol": symbol,
            "from": one_week_ago.strftime("%Y-%m-%d"),
            "to": today.strftime("%Y-%m-%d"),
            "token": FINNHUB_API_KEY
        }
        
        response = requests.get(url, params=params)
        news_data = response.json()
        
        if isinstance(news_data, list):
            formatted_news = []
            for item in news_data[:5]:  # Limit to 5 news items
                time_diff = today - datetime.fromtimestamp(item.get("datetime", 0))
                days = time_diff.days
                hours = time_diff.seconds // 3600
                
                if days > 0:
                    time_ago = f"{days} days ago"
                else:
                    time_ago = f"{hours} hours ago"
                
                formatted_news.append({
                    "title": item.get("headline", ""),
                    "timeAgo": time_ago
                })
            return formatted_news
        
        return []
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

def format_market_cap(market_cap):
    """Format market cap to readable format."""
    if market_cap >= 1e12:
        return f"{market_cap / 1e12:.2f}T"
    elif market_cap >= 1e9:
        return f"{market_cap / 1e9:.2f}B"
    elif market_cap >= 1e6:
        return f"{market_cap / 1e6:.2f}M"
    else:
        return f"{market_cap:.2f}"

def format_volume(volume):
    """Format volume to readable format."""
    if volume >= 1e9:
        return f"{volume / 1e9:.1f}B"
    elif volume >= 1e6:
        return f"{volume / 1e6:.1f}M"
    elif volume >= 1e3:
        return f"{volume / 1e3:.1f}K"
    else:
        return str(volume)

def format_revenue(revenue):
    """Format revenue to readable format."""
    if revenue >= 1e9:
        return f"${revenue / 1e9:.1f}B"
    elif revenue >= 1e6:
        return f"${revenue / 1e6:.1f}M"
    else:
        return f"${revenue:.2f}"

def get_stock_performance_data(symbol, period="5y"):
    """Get historical performance data for charting."""
    stock = Ticker(symbol)
    history = stock.history(period=period)
    
    if history.empty:
        return []
    
    # Resample to yearly data for 5y chart
    if period == "5y":
        yearly_data = history['close'].resample('Y').last().reset_index()
        result = []
        for i, row in yearly_data.iterrows():
            result.append({
                "year": str(row['date'].year),
                "value": round(row['close'], 2)
            })
        return result
    
    # For more detailed charts, use different resampling
    return []

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """Get a list of popular stocks."""
    # Default list of popular stocks
    popular_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]
    
    results = []
    for symbol in popular_symbols:
        try:
            stock_data = get_financial_data(symbol)
            if stock_data:
                results.append(stock_data)
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
    
    return jsonify(results)

@app.route('/api/stocks/<symbol>', methods=['GET'])
def get_stock(symbol):
    """Get detailed data for a specific stock."""
    try:
        stock_data = get_financial_data(symbol)
        if not stock_data:
            return jsonify({"error": "Stock not found"}), 404
        
        # Add performance chart data
        stock_data["performanceData"] = get_stock_performance_data(symbol)
        
        return jsonify(stock_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_stocks():
    """Search for stocks by symbol or name."""
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify([])
    
    # This would ideally use a more comprehensive API for stock search
    # For now, we'll just search through our popular stocks
    popular_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "JPM", "V"]
    
    results = []
    for symbol in popular_symbols:
        if query.upper() in symbol:
            try:
                stock_data = get_financial_data(symbol)
                if stock_data:
                    results.append(stock_data)
            except Exception as e:
                print(f"Error in search for {symbol}: {e}")
    
    return jsonify(results)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
</lov-write>
