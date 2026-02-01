// Market data types

export interface Symbol {
  id: string
  ticker: string
  name: string
  exchange: string
  instrumentType: 'stock' | 'etf' | 'forex' | 'crypto' | 'futures' | 'options' | 'bond' | 'commodity' | 'index' | 'cfd'
  currency: string
  pricePrecision: number
  quantityPrecision: number
  minQuantity?: number
  maxQuantity?: number
  lotSize?: number
  isActive: boolean
}

export interface Quote {
  symbol: string
  bid: number
  ask: number
  bidSize: number
  askSize: number
  lastPrice: number
  lastSize: number
  volume: number
  timestamp: string
  change: number
  changePercent: number
}

export interface OHLCV {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}

export interface OrderBook {
  symbol: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  timestamp: string
  sequence?: number
}

export interface OrderBookLevel {
  price: number
  volume: number
  orderCount?: number
}

export interface Trade {
  id: string
  symbol: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: number
  exchange: string
}

export interface Tick {
  symbol: string
  price: number
  volume: number
  timestamp: number
  exchange: string
  tradeId?: string
  bid?: number
  ask?: number
  bidSize?: number
  askSize?: number
}
