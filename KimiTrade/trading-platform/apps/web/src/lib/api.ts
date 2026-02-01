import axios from 'axios'

import type { Symbol, Quote, OHLCV, OrderBook } from '@types/market'

// Create axios instance
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Symbol API
export async function searchSymbols(query: string): Promise<Symbol[]> {
  const response = await api.get(`/symbols?search=${encodeURIComponent(query)}`)
  return response.data.items || []
}

export async function getSymbol(ticker: string): Promise<Symbol> {
  const response = await api.get(`/symbols/${ticker}`)
  return response.data
}

export async function listSymbols(page = 0, limit = 20): Promise<{
  items: Symbol[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const response = await api.get(`/symbols?page=${page}&limit=${limit}`)
  return response.data
}

// Quote API
export async function getQuote(symbol: string): Promise<Quote> {
  const response = await api.get(`/symbols/${symbol}/quote`)
  return response.data
}

// OHLCV API
export async function getOHLCV(
  symbol: string,
  timeframe: string,
  from?: number,
  to?: number,
  limit = 100
): Promise<OHLCV[]> {
  const params = new URLSearchParams({
    timeframe,
    limit: limit.toString(),
  })
  if (from) params.append('from', from.toString())
  if (to) params.append('to', to.toString())

  const response = await api.get(`/symbols/${symbol}/ohlcv?${params}`)
  return response.data
}

// Order Book API
export async function getOrderBook(symbol: string): Promise<OrderBook> {
  const response = await api.get(`/symbols/${symbol}/orderbook`)
  return response.data
}

// Trades API
export async function getTrades(
  symbol: string,
  from?: number,
  to?: number,
  limit = 100
): Promise<Trade[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  })
  if (from) params.append('from', from.toString())
  if (to) params.append('to', to.toString())

  const response = await api.get(`/symbols/${symbol}/trades?${params}`)
  return response.data
}

// Types
export interface Trade {
  id: string
  symbol: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: number
  exchange: string
}

export default api
