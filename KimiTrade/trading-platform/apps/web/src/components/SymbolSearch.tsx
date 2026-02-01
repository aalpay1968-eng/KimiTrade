import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline'

import { searchSymbols } from '@lib/api'

interface SymbolSearchProps {
  onSelect: (symbol: string) => void
  onClose: () => void
}

export function SymbolSearch({ onSelect, onClose }: SymbolSearchProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: symbols = [], isLoading } = useQuery({
    queryKey: ['symbolSearch', query],
    queryFn: () => searchSymbols(query),
    enabled: query.length > 0,
  })

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      ref={containerRef}
      className="w-80 bg-trading-bg-secondary border border-trading-border rounded-lg shadow-xl overflow-hidden"
    >
      {/* Search input */}
      <div className="flex items-center gap-2 p-3 border-b border-trading-border">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol or company..."
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
        />
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">Searching...</div>
        ) : symbols.length > 0 ? (
          <ul>
            {symbols.map((symbol) => (
              <li
                key={symbol.ticker}
                onClick={() => onSelect(symbol.ticker)}
                className="flex items-center justify-between px-4 py-2 hover:bg-trading-bg-tertiary cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-trading-bg-tertiary rounded flex items-center justify-center text-xs font-mono">
                    {symbol.exchange.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-mono font-medium">{symbol.ticker}</div>
                    <div className="text-xs text-gray-400">{symbol.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{symbol.exchange}</span>
                  <button className="p-1 hover:bg-trading-bg-tertiary rounded">
                    <StarIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : query.length > 0 ? (
          <div className="p-4 text-center text-gray-400">No results found</div>
        ) : (
          <div className="p-4 text-center text-gray-400">Type to search</div>
        )}
      </div>
    </div>
  )
}
