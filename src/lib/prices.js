import { useState, useEffect } from 'react'

const SYMBOLS = {
  // Acciones
  'AAPL': 'NASDAQ:AAPL',
  'TSLA': 'NASDAQ:TSLA',
  'NVDA': 'NASDAQ:NVDA',
  'AMZN': 'NASDAQ:AMZN',
  'MSFT': 'NASDAQ:MSFT',
  'GOOGL': 'NASDAQ:GOOGL',
  'META': 'NASDAQ:META',
  'NFLX': 'NASDAQ:NFLX',
  'AMD': 'NASDAQ:AMD',
  'COIN': 'NASDAQ:COIN',
  // Crypto
  'BTCUSDT': 'BINANCE:BTCUSDT',
  'ETHUSDT': 'BINANCE:ETHUSDT',
  'BNBUSDT': 'BINANCE:BNBUSDT',
  'SOLUSDT': 'BINANCE:SOLUSDT',
  'XRPUSDT': 'BINANCE:XRPUSDT',
  // Forex
  'EURUSD': 'FX:EURUSD',
  'GBPUSD': 'FX:GBPUSD',
  'USDJPY': 'FX:USDJPY',
  'USDMXN': 'FX:USDMXN',
  'USDCOP': 'FX:USDCOP',
  // Commodities
  'XAUUSD': 'TVC:GOLD',
  'USOIL': 'TVC:USOIL',
}

export function usePrices(symbols = []) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)

  async function fetchPrices() {
    const tickers = symbols.map(s => SYMBOLS[s] || s).filter(Boolean)
    if (!tickers.length) return
    try {
      const res = await fetch('https://scanner.tradingview.com/global/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: { tickers },
          columns: ['lp', 'close', 'change', 'volume']
        })
      })
      const json = await res.json()
      const updated = {}
      json.data?.forEach((item, i) => {
        const sym = symbols[i]
        const lp = item.d[0]
        const close = item.d[1]
        const change = item.d[2] ?? ((lp - close) / close * 100)
        updated[sym] = { price: lp, change, volume: item.d[3] }
      })
      setPrices(updated)
    } catch (e) {
      console.error('Price fetch error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!symbols.length) return
    fetchPrices()
    const interval = setInterval(fetchPrices, 15000)
    return () => clearInterval(interval)
  }, [symbols.join(',')])

  return { prices, loading }
}

export const ALL_ASSETS = [
  // Acciones
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', category: 'Tecnología' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', category: 'Tecnología' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', category: 'Tecnología' },
  { symbol: 'AMZN', name: 'Amazon.com', type: 'stock', category: 'Tecnología' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', category: 'Tecnología' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', category: 'Tecnología' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stock', category: 'Tecnología' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', category: 'Tecnología' },
  { symbol: 'AMD', name: 'AMD Inc.', type: 'stock', category: 'Tecnología' },
  { symbol: 'COIN', name: 'Coinbase Global', type: 'stock', category: 'Finanzas' },
  // Crypto
  { symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto', category: 'Crypto' },
  { symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto', category: 'Crypto' },
  { symbol: 'BNBUSDT', name: 'BNB', type: 'crypto', category: 'Crypto' },
  { symbol: 'SOLUSDT', name: 'Solana', type: 'crypto', category: 'Crypto' },
  { symbol: 'XRPUSDT', name: 'XRP', type: 'crypto', category: 'Crypto' },
  // Forex
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', category: 'Forex' },
  { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', category: 'Forex' },
  { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', category: 'Forex' },
  { symbol: 'USDMXN', name: 'USD/MXN', type: 'forex', category: 'Forex' },
  { symbol: 'USDCOP', name: 'USD/COP', type: 'forex', category: 'Forex' },
  // Commodities
  { symbol: 'XAUUSD', name: 'Oro (XAU/USD)', type: 'commodity', category: 'Materias Primas' },
  { symbol: 'USOIL', name: 'Petróleo WTI', type: 'commodity', category: 'Materias Primas' },
]
