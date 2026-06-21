import { useState, useEffect, useRef } from 'react'

// ===== CATÁLOGO COMPLETO DE ACCIONES US + CRYPTO + FOREX + COMMODITIES =====
export const ALL_ASSETS = [
  // ---- TECNOLOGÍA ----
  { symbol: 'AAPL', tv: 'NASDAQ:AAPL', name: 'Apple Inc.', sector: 'Tecnología', mcap: 3450, pe: 32.4 },
  { symbol: 'MSFT', tv: 'NASDAQ:MSFT', name: 'Microsoft Corp.', sector: 'Tecnología', mcap: 3380, pe: 36.1 },
  { symbol: 'NVDA', tv: 'NASDAQ:NVDA', name: 'NVIDIA Corp.', sector: 'Tecnología', mcap: 3300, pe: 65.2 },
  { symbol: 'GOOGL', tv: 'NASDAQ:GOOGL', name: 'Alphabet Inc.', sector: 'Tecnología', mcap: 2150, pe: 26.8 },
  { symbol: 'META', tv: 'NASDAQ:META', name: 'Meta Platforms', sector: 'Tecnología', mcap: 1480, pe: 28.3 },
  { symbol: 'AMD', tv: 'NASDAQ:AMD', name: 'AMD Inc.', sector: 'Tecnología', mcap: 240, pe: 45.7 },
  { symbol: 'AVGO', tv: 'NASDAQ:AVGO', name: 'Broadcom Inc.', sector: 'Tecnología', mcap: 820, pe: 38.9 },
  { symbol: 'ORCL', tv: 'NYSE:ORCL', name: 'Oracle Corp.', sector: 'Tecnología', mcap: 480, pe: 41.2 },
  { symbol: 'CRM', tv: 'NYSE:CRM', name: 'Salesforce Inc.', sector: 'Tecnología', mcap: 310, pe: 52.1 },
  { symbol: 'ADBE', tv: 'NASDAQ:ADBE', name: 'Adobe Inc.', sector: 'Tecnología', mcap: 240, pe: 44.6 },
  { symbol: 'INTC', tv: 'NASDAQ:INTC', name: 'Intel Corp.', sector: 'Tecnología', mcap: 95, pe: 0 },
  { symbol: 'CSCO', tv: 'NASDAQ:CSCO', name: 'Cisco Systems', sector: 'Tecnología', mcap: 235, pe: 24.3 },
  { symbol: 'QCOM', tv: 'NASDAQ:QCOM', name: 'Qualcomm Inc.', sector: 'Tecnología', mcap: 185, pe: 18.7 },
  { symbol: 'PLTR', tv: 'NASDAQ:PLTR', name: 'Palantir Tech.', sector: 'Tecnología', mcap: 165, pe: 215.3 },

  // ---- FINANZAS ----
  { symbol: 'JPM', tv: 'NYSE:JPM', name: 'JPMorgan Chase', sector: 'Finanzas', mcap: 720, pe: 13.2 },
  { symbol: 'V', tv: 'NYSE:V', name: 'Visa Inc.', sector: 'Finanzas', mcap: 580, pe: 31.5 },
  { symbol: 'MA', tv: 'NYSE:MA', name: 'Mastercard Inc.', sector: 'Finanzas', mcap: 470, pe: 38.4 },
  { symbol: 'BAC', tv: 'NYSE:BAC', name: 'Bank of America', sector: 'Finanzas', mcap: 340, pe: 14.1 },
  { symbol: 'WFC', tv: 'NYSE:WFC', name: 'Wells Fargo', sector: 'Finanzas', mcap: 250, pe: 13.8 },
  { symbol: 'GS', tv: 'NYSE:GS', name: 'Goldman Sachs', sector: 'Finanzas', mcap: 185, pe: 16.2 },
  { symbol: 'COIN', tv: 'NASDAQ:COIN', name: 'Coinbase Global', sector: 'Finanzas', mcap: 75, pe: 48.9 },

  // ---- CONSUMO ----
  { symbol: 'AMZN', tv: 'NASDAQ:AMZN', name: 'Amazon.com', sector: 'Consumo', mcap: 2280, pe: 42.7 },
  { symbol: 'TSLA', tv: 'NASDAQ:TSLA', name: 'Tesla Inc.', sector: 'Consumo', mcap: 1100, pe: 112.4 },
  { symbol: 'WMT', tv: 'NYSE:WMT', name: 'Walmart Inc.', sector: 'Consumo', mcap: 760, pe: 41.3 },
  { symbol: 'HD', tv: 'NYSE:HD', name: 'Home Depot', sector: 'Consumo', mcap: 410, pe: 27.1 },
  { symbol: 'NKE', tv: 'NYSE:NKE', name: 'Nike Inc.', sector: 'Consumo', mcap: 115, pe: 22.8 },
  { symbol: 'MCD', tv: 'NYSE:MCD', name: "McDonald's Corp.", sector: 'Consumo', mcap: 215, pe: 26.4 },
  { symbol: 'SBUX', tv: 'NASDAQ:SBUX', name: 'Starbucks Corp.', sector: 'Consumo', mcap: 105, pe: 28.9 },
  { symbol: 'KO', tv: 'NYSE:KO', name: 'Coca-Cola Co.', sector: 'Consumo', mcap: 270, pe: 24.6 },

  // ---- ENTRETENIMIENTO ----
  { symbol: 'NFLX', tv: 'NASDAQ:NFLX', name: 'Netflix Inc.', sector: 'Entretenimiento', mcap: 380, pe: 45.2 },
  { symbol: 'DIS', tv: 'NYSE:DIS', name: 'Walt Disney Co.', sector: 'Entretenimiento', mcap: 200, pe: 38.1 },

  // ---- SALUD ----
  { symbol: 'UNH', tv: 'NYSE:UNH', name: 'UnitedHealth', sector: 'Salud', mcap: 510, pe: 33.7 },
  { symbol: 'JNJ', tv: 'NYSE:JNJ', name: 'Johnson & Johnson', sector: 'Salud', mcap: 380, pe: 23.4 },
  { symbol: 'LLY', tv: 'NYSE:LLY', name: 'Eli Lilly & Co.', sector: 'Salud', mcap: 720, pe: 78.2 },
  { symbol: 'PFE', tv: 'NYSE:PFE', name: 'Pfizer Inc.', sector: 'Salud', mcap: 145, pe: 16.8 },

  // ---- ENERGÍA ----
  { symbol: 'XOM', tv: 'NYSE:XOM', name: 'Exxon Mobil', sector: 'Energía', mcap: 480, pe: 13.9 },
  { symbol: 'CVX', tv: 'NYSE:CVX', name: 'Chevron Corp.', sector: 'Energía', mcap: 280, pe: 14.2 },

  // ---- CRYPTO ----
  { symbol: 'BTCUSD', tv: 'BINANCE:BTCUSDT', name: 'Bitcoin', sector: 'Crypto', mcap: 1900, pe: 0 },
  { symbol: 'ETHUSD', tv: 'BINANCE:ETHUSDT', name: 'Ethereum', sector: 'Crypto', mcap: 420, pe: 0 },
  { symbol: 'BNBUSD', tv: 'BINANCE:BNBUSDT', name: 'BNB', sector: 'Crypto', mcap: 95, pe: 0 },
  { symbol: 'SOLUSD', tv: 'BINANCE:SOLUSDT', name: 'Solana', sector: 'Crypto', mcap: 78, pe: 0 },
  { symbol: 'XRPUSD', tv: 'BINANCE:XRPUSDT', name: 'XRP', sector: 'Crypto', mcap: 135, pe: 0 },
  { symbol: 'ADAUSD', tv: 'BINANCE:ADAUSDT', name: 'Cardano', sector: 'Crypto', mcap: 32, pe: 0 },
  { symbol: 'DOGEUSD', tv: 'BINANCE:DOGEUSDT', name: 'Dogecoin', sector: 'Crypto', mcap: 28, pe: 0 },

  // ---- FOREX ----
  { symbol: 'EURUSD', tv: 'FX:EURUSD', name: 'Euro / US Dollar', sector: 'Forex', mcap: 0, pe: 0 },
  { symbol: 'GBPUSD', tv: 'FX:GBPUSD', name: 'British Pound / USD', sector: 'Forex', mcap: 0, pe: 0 },
  { symbol: 'USDJPY', tv: 'FX:USDJPY', name: 'US Dollar / Yen', sector: 'Forex', mcap: 0, pe: 0 },
  { symbol: 'USDMXN', tv: 'FX:USDMXN', name: 'USD / Peso Mexicano', sector: 'Forex', mcap: 0, pe: 0 },
  { symbol: 'USDCOP', tv: 'FX_IDC:USDCOP', name: 'USD / Peso Colombiano', sector: 'Forex', mcap: 0, pe: 0 },
  { symbol: 'USDBRL', tv: 'FX_IDC:USDBRL', name: 'USD / Real Brasileño', sector: 'Forex', mcap: 0, pe: 0 },

  // ---- MATERIAS PRIMAS ----
  { symbol: 'XAUUSD', tv: 'TVC:GOLD', name: 'Oro (Gold)', sector: 'Materias Primas', mcap: 0, pe: 0 },
  { symbol: 'XAGUSD', tv: 'TVC:SILVER', name: 'Plata (Silver)', sector: 'Materias Primas', mcap: 0, pe: 0 },
  { symbol: 'USOIL', tv: 'TVC:USOIL', name: 'Petróleo WTI', sector: 'Materias Primas', mcap: 0, pe: 0 },
  { symbol: 'UKOIL', tv: 'TVC:UKOIL', name: 'Petróleo Brent', sector: 'Materias Primas', mcap: 0, pe: 0 },
]

// Índices US
export const INDICES = [
  { symbol: 'SPX', tv: 'SP:SPX', name: 'S&P 500', sub: 'US Large Cap' },
  { symbol: 'NDX', tv: 'NASDAQ:NDX', name: 'NASDAQ 100', sub: 'Tech Index' },
  { symbol: 'DJI', tv: 'DJ:DJI', name: 'DOW JONES', sub: 'US Blue Chip' },
  { symbol: 'RUT', tv: 'TVC:RUT', name: 'RUSSELL 2000', sub: 'Small Cap' },
]

export const SECTORS = ['Tecnología', 'Finanzas', 'Consumo', 'Entretenimiento', 'Salud', 'Energía', 'Crypto', 'Forex', 'Materias Primas']

const TV_MAP = {}
ALL_ASSETS.forEach(a => { TV_MAP[a.symbol] = a.tv })
INDICES.forEach(i => { TV_MAP[i.symbol] = i.tv })

// ===== FETCH PRECIOS DESDE TRADINGVIEW SCANNER =====
export async function fetchTradingViewPrices(symbols) {
  const tickers = symbols.map(s => TV_MAP[s] || s).filter(Boolean)
  if (!tickers.length) return {}
  const res = await fetch('https://scanner.tradingview.com/global/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbols: { tickers },
      columns: ['lp', 'close', 'change', 'volume', 'High.1M', 'Low.1M', 'high', 'low', 'open', 'market_cap_basic', 'price_earnings_ttm', 'RSI']
    })
  })
  const json = await res.json()
  const out = {}
  json.data?.forEach((item, i) => {
    const sym = symbols[i]
    const d = item.d
    out[sym] = {
      price: d[0], close: d[1], change: d[2] ?? 0, volume: d[3],
      high1m: d[4], low1m: d[5], high: d[6], low: d[7], open: d[8],
      mcap: d[9], pe: d[10], rsi: d[11]
    }
  })
  return out
}

// ===== HOOK GLOBAL DE PRECIOS =====
export function usePrices(symbols = [], intervalMs = 15000) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const symbolsRef = useRef(symbols)
  symbolsRef.current = symbols

  async function load() {
    try {
      const data = await fetchTradingViewPrices(symbolsRef.current)
      setPrices(prev => ({ ...prev, ...data }))
    } catch (e) {
      console.error('Price fetch error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!symbols.length) { setLoading(false); return }
    load()
    const interval = setInterval(load, intervalMs)
    return () => clearInterval(interval)
  }, [symbols.join(','), intervalMs])

  return { prices, loading, refresh: load }
}

// Helpers de formato
export const fmtPrice = (p) => {
  if (p == null) return '—'
  if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (p >= 1) return p.toFixed(2)
  return p.toFixed(4)
}
export const fmtChange = (c) => c == null ? '—' : `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`
export const fmtMcap = (m) => {
  if (!m) return '—'
  if (m >= 1000) return `$${(m / 1000).toFixed(2)}T`
  return `$${m.toFixed(0)}B`
}
export const fmtVolume = (v) => {
  if (!v) return '—'
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(2)}K`
  return v.toFixed(0)
}
