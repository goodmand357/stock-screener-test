import requests
from yahooquery import Ticker
from config import (
    ALPHA_VANTAGE_API_KEY,
    GOOGLE_FINANCE_API_KEY,
    FINNHUB_API_KEY,
    TWELVE_DATA_API_KEY,
    POLYGON_API_KEY,
    ALPHA_VANTAGE_BASE_URL,
    GOOGLE_FINANCE_BASE_URL,
    FINNHUB_BASE_URL,
    TWELVE_DATA_BASE_URL,
    POLYGON_BASE_URL,
)

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
    print("DEBUG MODULES:", modules)

    module_data = modules.get(symbol) or modules.get(symbol.upper()) or {}
    summary = module_data.get("summaryDetail", {})
    profile = module_data.get("assetProfile", {})

    # Income statement (trailing)
    income_stmt = stock.income_statement(trailing=True)
    print("DEBUG INCOME STMT:\n", income_stmt)

    # Extract financials
    result = {
        "market_cap": summary.get("marketCap"),
        "price": summary.get("regularMarketPrice"),
        "pe_ratio": summary.get("trailingPE"),
        "dividend_yield": summary.get("dividendYield"),
        "sector": profile.get("sector"),
        "industry": profile.get("industry"),
        "beta_1y": summary.get("beta"),
        "revenue": None,
        "net_profit": None
    }

    # Handle pandas DataFrame (income statement)
    if not income_stmt.empty:
        if "TotalRevenue" in income_stmt.columns:
            result["revenue"] = income_stmt["TotalRevenue"].iloc[0]
        if "NetIncome" in income_stmt.columns:
            result["net_profit"] = income_stmt["NetIncome"].iloc[0]

    # Fallback for price
    if result["price"] is None:
        print("📉 Falling back to Alpha Vantage for price")
        result["price"] = get_price_from_alpha_vantage(symbol)

    return result

# Run script directly
if __name__ == "__main__":
    ticker = "AAPL"
    print(f"\n📊 Full Stock Data for: {ticker}")
    data = get_financial_data(ticker)
    for k, v in data.items():
        print(f"{k}: {v}")
