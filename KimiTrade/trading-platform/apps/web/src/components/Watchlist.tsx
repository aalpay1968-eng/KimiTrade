import { useState } from 'react'
import { PlusIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

import { useChartStore } from '@stores/chartStore'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const mockWatchlist: WatchlistItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 2.34, changePercent: 1.21 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 374.58, change: -1.23, changePercent: -0.33 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.89, changePercent: 0.63 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 153.42, change: 3.21, changePercent: 2.14 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.67, changePercent: -2.23 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.45, changePercent: 2.58 },
]

export function Watchlist() {
  const { setSymbol } = useChartStore()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist)

  const handleSymbolClick = (symbol: string) => {
    setSymbol(symbol)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-trading-border">
        <h3 className="font-medium">Watchlist</h3>
        <button className="p-1 hover:bg-trading-bg-tertiary rounded">
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.map((item) => (
          <div
            key={item.symbol}
            onClick={() => handleSymbolClick(item.symbol)}
            className="flex items-center justify-between p-3 hover:bg-trading-bg-tertiary cursor-pointer border-b border-trading-border"
          >
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-trading-bg-tertiary rounded">
                <StarIcon className="w-4 h-4 text-gray-500" />
              </button>
              <div>
                <div className="font-mono font-medium">{item.symbol}</div>
                <div className="text-xs text-gray-400">{item.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono">{item.price.toFixed(2)}</div>
              <div className={`text-xs ${item.change >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                {item.change >= 0 ? '+' : ''}
                {item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}
                {item.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
