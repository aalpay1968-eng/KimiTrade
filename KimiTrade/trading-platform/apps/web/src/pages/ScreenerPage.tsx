import { useState } from 'react'
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ScreenerResult {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  pe: number
  sector: string
}

const mockResults: ScreenerResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 2.34, changePercent: 1.21, volume: 52400000, marketCap: '3.02T', pe: 29.5, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 374.58, change: -1.23, changePercent: -0.33, volume: 22100000, marketCap: '2.78T', pe: 34.2, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.89, changePercent: 0.63, volume: 18500000, marketCap: '1.76T', pe: 24.8, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 153.42, change: 3.21, changePercent: 2.14, volume: 42300000, marketCap: '1.58T', pe: 58.3, sector: 'Consumer Cyclical' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.45, changePercent: 2.58, volume: 45600000, marketCap: '1.22T', pe: 62.1, sector: 'Technology' },
]

const sectors = ['All', 'Technology', 'Healthcare', 'Finance', 'Consumer Cyclical', 'Energy', 'Utilities']

export default function ScreenerPage() {
  const [filters, setFilters] = useState({
    sector: 'All',
    minPrice: '',
    maxPrice: '',
    minVolume: '',
    minChange: '',
  })
  const [results, setResults] = useState<ScreenerResult[]>(mockResults)
  const [isLoading, setIsLoading] = useState(false)

  const handleFilter = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      let filtered = mockResults
      
      if (filters.sector !== 'All') {
        filtered = filtered.filter(r => r.sector === filters.sector)
      }
      if (filters.minPrice) {
        filtered = filtered.filter(r => r.price >= parseFloat(filters.minPrice))
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(r => r.price <= parseFloat(filters.maxPrice))
      }
      if (filters.minVolume) {
        filtered = filtered.filter(r => r.volume >= parseInt(filters.minVolume) * 1e6)
      }
      if (filters.minChange) {
        filtered = filtered.filter(r => r.changePercent >= parseFloat(filters.minChange))
      }
      
      setResults(filtered)
      setIsLoading(false)
    }, 500)
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toString()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Stock Screener</h1>
        <button 
          onClick={handleFilter}
          disabled={isLoading}
          className="btn btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <ArrowPathIcon className="w-4 h-4 spinner" />
          ) : (
            <FunnelIcon className="w-4 h-4" />
          )}
          Apply Filters
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sector</label>
            <select
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              className="input w-full"
            >
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Price</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="0"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="∞"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Volume (M)</label>
            <input
              type="number"
              value={filters.minVolume}
              onChange={(e) => setFilters({ ...filters, minVolume: e.target.value })}
              placeholder="0"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Change %</label>
            <input
              type="number"
              value={filters.minChange}
              onChange={(e) => setFilters({ ...filters, minChange: e.target.value })}
              placeholder="-100"
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card overflow-hidden">
        <div className="p-3 border-b border-trading-border text-sm text-gray-400">
          Found {results.length} results
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Sector</th>
              <th>Price</th>
              <th>Change</th>
              <th>Volume</th>
              <th>Market Cap</th>
              <th>P/E</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => (
              <tr key={item.symbol}>
                <td className="font-mono font-medium">{item.symbol}</td>
                <td>{item.name}</td>
                <td>{item.sector}</td>
                <td className="font-mono">${item.price.toFixed(2)}</td>
                <td className={item.change >= 0 ? 'text-trading-up' : 'text-trading-down'}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                </td>
                <td className="font-mono">{formatNumber(item.volume)}</td>
                <td>{item.marketCap}</td>
                <td>{item.pe.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
