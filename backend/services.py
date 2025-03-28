import requests
from yahooquery import Ticker
import config

# ============================
# Alpha Vantage as Primary Source
# ============================
def get_from_alpha_vantage(symbol):
    base_url = config.ALPHA_VANTAGE_BASE_URL
    api_key = config.ALPHA_VANTAGE_API_KEY

    try:
        # Price
        price_url = f"{base_url}?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"
        price_resp = requests.get(price_url).json()
        price = price_resp.get("Global Quote", {}).get("05. price")

        # Overview
        overview_url = f"{base_url}?function=OVERVIEW&symbol={symbol}&apikey={api_key}"
        overview_resp = requests.get(overview_url).json()

        return {
            "price": float(price) if price else None,
            "pe_ratio": float(overview_resp.get("PERatio", 0)) or None,
            "eps": float(overview_resp.get("EPS", 0)) or None,
            "dividend_yield": float(overview_resp.get("DividendYield", 0)) or None,
            "sector": overview_resp.get("Sector"),
            "industry": overview_resp.get("Industry"),
            "market_cap": float(overview_resp.get("MarketCapitalization", 0)) or None,
            "revenue": float(overview_resp.get("RevenueTTM", 0)) or None,
            "net_profit": float(overview_resp.get("NetIncomeTTM", 0)) or None,
            "eps_growth_yoy": float(overview_resp.get("QuarterlyEarningsGrowthYOY", 0)) or None,
            "revenue_growth_yoy": float(overview_resp.get("QuarterlyRevenueGrowthYOY", 0)) or None,
        }
    except:
        return {}

# ============================
# Technical Indicators from Alpha Vantage
# ============================
def get_technical_indicators(symbol):
    base_url = config.ALPHA_VANTAGE_BASE_URL
    api_key = config.ALPHA_VANTAGE_API_KEY
    interval = "daily"

    def get_indicator(function):
        url = f"{base_url}?function={function}&symbol={symbol}&interval={interval}&time_period=10&series_type=close&apikey={api_key}"
        resp = requests.get(url).json()
        return resp.get("Technical Analysis: Daily", {})

    try:
        sma = get_indicator("SMA")
        rsi = get_indicator("RSI")
        momentum = get_indicator("MOM")
        latest_date = next(iter(sma), None)

        return {
            "sma_10": float(sma.get(latest_date, {}).get("SMA", 0)) if latest_date else None,
            "rsi": float(rsi.get(latest_date, {}).get("RSI", 0)) if latest_date else None,
            "momentum": float(momentum.get(latest_date, {}).get("MOM", 0)) if latest_date else None,
        }
    except:
        return {}

# ============================
# Fallback: Yahoo Finance via yahooquery
# ============================
def get_from_yahoo(symbol):
    try:
        stock = Ticker(symbol)
        modules = stock.get_modules(["summaryDetail", "assetProfile", "financialData"])
        summary = modules.get(symbol, {}).get("summaryDetail", {})
        profile = modules.get(symbol, {}).get("assetProfile", {})
        financial = modules.get(symbol, {}).get("financialData", {})
        income_stmt = stock.income_statement(trailing=True)

        try:
            rev = income_stmt["TotalRevenue"][:4]
            rev = rev.reset_index(drop=True)
            revenue_growth = [(rev[i] - rev[i+1]) / rev[i+1] * 100 for i in range(3)]
        except:
            revenue_growth = [None, None, None]

        return {
            "price": summary.get("regularMarketPrice"),
            "pe_ratio": summary.get("trailingPE"),
            "eps": financial.get("epsTrailingTwelveMonths"),
            "dividend_yield": summary.get("dividendYield"),
            "sector": profile.get("sector"),
            "industry": profile.get("industry"),
            "market_cap": summary.get("marketCap"),
            "revenue": financial.get("totalRevenue"),
            "net_profit": financial.get("netIncomeToCommon"),
            "eps_growth_yoy": financial.get("earningsQuarterlyGrowth"),
            "revenue_growth_yoy": financial.get("revenueGrowth"),
            "revenue_growth_y1": revenue_growth[0],
            "revenue_growth_y2": revenue_growth[1],
            "revenue_growth_y3": revenue_growth[2],
        }
    except:
        return {}

# ============================
# Finnhub API fallback
# ============================
def get_from_finnhub(symbol):
    api_key = config.FINNHUB_API_KEY
    base_url = config.FINNHUB_BASE_URL

    eps_trend_url = f"{base_url}/stock/earnings?symbol={symbol}&token={api_key}"
    recommendation_url = f"{base_url}/stock/recommendation?symbol={symbol}&token={api_key}"

    eps_trend = []
    recommendation = {}

    try:
        eps_resp = requests.get(eps_trend_url).json()
        if isinstance(eps_resp, list):
            eps_trend = eps_resp[:3]  # Limit to last 3 quarters
    except:
        pass

    try:
        rec_resp = requests.get(recommendation_url).json()
        if isinstance(rec_resp, list) and rec_resp:
            recommendation = rec_resp[0]  # Latest
    except:
        pass

    return {
        "eps_trend": eps_trend,
        "recommendation": recommendation,
    }

# ============================
# Polygon API placeholder
# ============================
def get_from_polygon(symbol):
    return {}

# ============================
# Utility: Smart Merge
# ============================
def smart_merge(*sources):
    result = {}
    for source in sources:
        for k, v in source.items():
            if k not in result or result[k] is None:
                result[k] = v
    return result

# ============================
# Final Aggregator
# ============================
def get_full_stock_data(symbol):
    yahoo_data = get_from_yahoo(symbol) or {}
    alpha_data = get_from_alpha_vantage(symbol) or {}
    tech_data = get_technical_indicators(symbol) or {}
    finnhub_data = get_from_finnhub(symbol) or {}
    polygon_data = get_from_polygon(symbol) or {}

    return smart_merge(
        alpha_data,
        yahoo_data,
        tech_data,
        finnhub_data,
        polygon_data,
        {"ticker": symbol.upper()}
    )

if __name__ == "__main__":
    symbol = "AAPL"
    stock_data = get_full_stock_data(symbol)
    for key, val in stock_data.items():
        print(f"{key}: {val}")
