import { useState, useRef, useEffect } from 'react'
import {
  ChartBarIcon,
  Bars3Icon,
  ArrowTrendingUpIcon,
  Square3Stack3DIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

import { useChartStore } from '@stores/chartStore'
import type { ChartType } from '@types/chart'

const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
  { value: 'candlestick', label: 'Candles', icon: <ChartBarIcon className="w-4 h-4" /> },
  { value: 'bar', label: 'Bars', icon: <Bars3Icon className="w-4 h-4" /> },
  { value: 'line', label: 'Line', icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
  { value: 'area', label: 'Area', icon: <Square3Stack3DIcon className="w-4 h-4" /> },
]

export function ChartTypeSelector() {
  const { chartType, setChartType } = useChartStore()
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

  const handleSelect = (type: ChartType) => {
    setChartType(type)
    setIsOpen(false)
  }

  const currentType = chartTypes.find((t) => t.value === chartType)

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-trading-bg-tertiary rounded hover:bg-gray-700 transition-colors"
      >
        {currentType?.icon}
        <span className="text-sm">{currentType?.label}</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-trading-bg-secondary border border-trading-border rounded-lg shadow-xl z-50">
          {chartTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleSelect(type.value)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-trading-bg-tertiary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                chartType === type.value ? 'text-trading-accent' : 'text-gray-300'
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
