import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

import { useChartStore } from '@stores/chartStore'
import type { Timeframe } from '@types/chart'

const timeframes: { value: Timeframe; label: string; group: string }[] = [
  // Seconds
  { value: '1s', label: '1s', group: 'Seconds' },
  { value: '5s', label: '5s', group: 'Seconds' },
  { value: '15s', label: '15s', group: 'Seconds' },
  { value: '30s', label: '30s', group: 'Seconds' },
  // Minutes
  { value: '1m', label: '1m', group: 'Minutes' },
  { value: '3m', label: '3m', group: 'Minutes' },
  { value: '5m', label: '5m', group: 'Minutes' },
  { value: '15m', label: '15m', group: 'Minutes' },
  { value: '30m', label: '30m', group: 'Minutes' },
  // Hours
  { value: '1h', label: '1h', group: 'Hours' },
  { value: '2h', label: '2h', group: 'Hours' },
  { value: '4h', label: '4h', group: 'Hours' },
  // Days/Weeks/Months
  { value: '1D', label: 'D', group: 'Daily' },
  { value: '1W', label: 'W', group: 'Weekly' },
  { value: '1M', label: 'M', group: 'Monthly' },
]

export function TimeframeSelector() {
  const { timeframe, setTimeframe } = useChartStore()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (tf: Timeframe) => {
    setTimeframe(tf)
    setIsOpen(false)
  }

  // Group timeframes
  const grouped = timeframes.reduce((acc, tf) => {
    if (!acc[tf.group]) acc[tf.group] = []
    acc[tf.group].push(tf)
    return acc
  }, {} as Record<string, typeof timeframes>)

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 bg-trading-bg-tertiary rounded hover:bg-gray-700 transition-colors"
      >
        <span className="font-mono text-sm">{timeframe}</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-trading-bg-secondary border border-trading-border rounded-lg shadow-xl z-50">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="border-b border-trading-border last:border-0">
              <div className="px-3 py-1 text-xs text-gray-500 uppercase">{group}</div>
              <div className="flex flex-wrap gap-1 p-2">
                {items.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => handleSelect(tf.value)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      timeframe === tf.value
                        ? 'bg-trading-accent text-white'
                        : 'hover:bg-trading-bg-tertiary text-gray-300'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
