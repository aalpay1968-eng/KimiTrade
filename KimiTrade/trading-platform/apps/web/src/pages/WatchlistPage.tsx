import { useState } from 'react'
import { useChartStore } from '@stores/chartStore'
import { Link } from 'react-router-dom'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
}

const mockData: WatchlistItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 2.34, changePercent: 1.21, volume: 52400000, marketCap: '3.02T' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 374.58, change: -1.23, changePercent: -0.33, volume: 22100000, marketCap: '2.78T' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.89, changePercent: 0.63, volume: 18500000, marketCap: '1.76T' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 153.42, change: 3.21, changePercent: 2.14, volume: 42300000, marketCap: '1.58T' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.67, changePercent: -2.23, volume: 98200000, marketCap: '789B' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.45, changePercent: 2.58, volume: 45600000, marketCap: '1.22T' },
  { symbol: 'META', name: 'Meta Platforms', price: 353.45, change: 4.56, changePercent: 1.31, volume: 15200000, marketCap: '920B' },
  { symbol: 'BABA', name: 'Alibaba Group', price: 74.52, change: -1.23, changePercent: -1.62, volume: 12800000, marketCap: '189B' },
]

export default function WatchlistPage() {
  const [sortBy, setSortBy] = useState<keyof WatchlistItem>('symbol')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { setSymbol } = useChartStore()

  const sortedData = [...mockData].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  const handleSort = (key: keyof WatchlistItem) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
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
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <button className="btn btn-primary">+ Add Symbol</button>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <SortableHeader label="Symbol" sortKey="symbol" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader label="Name" sortKey="name" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader label="Price" sortKey="price" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader label="Change" sortKey="changePercent" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader label="Volume" sortKey="volume" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader label="Market Cap" sortKey="marketCap" currentSort={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.symbol}>
                <td className="font-mono font-medium">{item.symbol}</td>
                <td>{item.name}</td>
                <td className="font-mono">${item.price.toFixed(2)}</td>
                <td className={item.change >= 0 ? 'text-trading-up' : 'text-trading-down'}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                </td>
                <td className="font-mono">{formatNumber(item.volume)}</td>
                <td>{item.marketCap}</td>
                <td>
                  <Link
                    to={`/chart/${item.symbol}`}
                    onClick={() => setSymbol(item.symbol)}
                    className="text-trading-accent hover:underline"
                  >
                    Chart
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  sortKey: keyof WatchlistItem
  currentSort: keyof WatchlistItem
  sortOrder: 'asc' | 'desc'
  onSort: (key: keyof WatchlistItem) => void
}

function SortableHeader({ label, sortKey, currentSort, sortOrder, onSort }: SortableHeaderProps) {
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="cursor-pointer hover:bg-trading-bg-tertiary"
    >
      <div className="flex items-center gap-1">
        {label}
        {currentSort === sortKey && (
          <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )
}
