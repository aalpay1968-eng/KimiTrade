import { useState } from 'react'
import { PlusIcon, EyeIcon, EyeSlashIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

import { useChartStore, type IndicatorConfig } from '@stores/chartStore'

const availableIndicators = [
  { type: 'sma', name: 'SMA', defaultParams: { period: 20 } },
  { type: 'ema', name: 'EMA', defaultParams: { period: 20 } },
  { type: 'rsi', name: 'RSI', defaultParams: { period: 14 } },
  { type: 'macd', name: 'MACD', defaultParams: { fast: 12, slow: 26, signal: 9 } },
  { type: 'bollinger', name: 'Bollinger Bands', defaultParams: { period: 20, stdDev: 2 } },
  { type: 'volume', name: 'Volume', defaultParams: {} },
  { type: 'atr', name: 'ATR', defaultParams: { period: 14 } },
  { type: 'stochastic', name: 'Stochastic', defaultParams: { k: 14, d: 3, smooth: 3 } },
]

export function IndicatorPanel() {
  const { indicators, addIndicator, removeIndicator, updateIndicator } = useChartStore()
  const [showAddMenu, setShowAddMenu] = useState(false)

  const handleAddIndicator = (indicatorType: typeof availableIndicators[0]) => {
    const newIndicator: IndicatorConfig = {
      id: `${indicatorType.type}-${Date.now()}`,
      type: indicatorType.type,
      name: indicatorType.name,
      params: { ...indicatorType.defaultParams },
      visible: true,
      pane: 0,
      style: {
        color: '#2962ff',
        lineWidth: 2,
        lineStyle: 'solid',
      },
    }
    addIndicator(newIndicator)
    setShowAddMenu(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-trading-border">
        <h3 className="font-medium">Indicators</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1 hover:bg-trading-bg-tertiary rounded"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          
          {showAddMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-trading-bg-secondary border border-trading-border rounded-lg shadow-xl z-50">
              {availableIndicators.map((ind) => (
                <button
                  key={ind.type}
                  onClick={() => handleAddIndicator(ind)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-trading-bg-tertiary transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {ind.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Indicator list */}
      <div className="flex-1 overflow-y-auto">
        {indicators.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No indicators added
          </div>
        ) : (
          indicators.map((indicator) => (
            <div
              key={indicator.id}
              className="flex items-center justify-between p-3 border-b border-trading-border hover:bg-trading-bg-tertiary"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: indicator.style?.color || '#2962ff' }}
                />
                <div>
                  <div className="text-sm font-medium">{indicator.name}</div>
                  <div className="text-xs text-gray-400">
                    {Object.entries(indicator.params)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(', ')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateIndicator(indicator.id, { visible: !indicator.visible })}
                  className="p-1 hover:bg-trading-bg-tertiary rounded text-gray-400"
                >
                  {indicator.visible ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4" />
                  )}
                </button>
                <button className="p-1 hover:bg-trading-bg-tertiary rounded text-gray-400">
                  <Cog6ToothIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeIndicator(indicator.id)}
                  className="p-1 hover:bg-trading-bg-tertiary rounded text-gray-400 hover:text-red-500"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
