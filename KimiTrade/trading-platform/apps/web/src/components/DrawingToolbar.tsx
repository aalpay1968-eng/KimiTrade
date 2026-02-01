import { useState } from 'react'
import {
  PencilIcon,
  ArrowLongRightIcon,
  MinusIcon,
  ArrowsUpDownIcon,
  Square2StackIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline'

import type { DrawingTool } from '@types/chart'

const drawingTools: { type: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { type: 'cursor', icon: <PencilIcon className="w-4 h-4" />, label: 'Cursor' },
  { type: 'trendLine', icon: <ArrowLongRightIcon className="w-4 h-4" />, label: 'Trend Line' },
  { type: 'horizontalLine', icon: <MinusIcon className="w-4 h-4" />, label: 'Horizontal' },
  { type: 'verticalLine', icon: <ArrowsUpDownIcon className="w-4 h-4" />, label: 'Vertical' },
  { type: 'rectangle', icon: <Square2StackIcon className="w-4 h-4" />, label: 'Rectangle' },
  { type: 'fibonacciRetracement', icon: <CircleStackIcon className="w-4 h-4" />, label: 'Fibonacci' },
]

export function DrawingToolbar() {
  const [activeTool, setActiveTool] = useState<DrawingTool>('cursor')

  return (
    <div className="flex items-center gap-1">
      {drawingTools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => setActiveTool(tool.type)}
          className={`p-1.5 rounded transition-colors ${
            activeTool === tool.type
              ? 'bg-trading-accent text-white'
              : 'text-gray-400 hover:bg-trading-bg-tertiary'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
