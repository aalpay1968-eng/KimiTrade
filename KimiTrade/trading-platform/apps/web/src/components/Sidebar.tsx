import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

import { Watchlist } from './Watchlist'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`bg-trading-bg-secondary border-r border-trading-border transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center h-10 border-b border-trading-border hover:bg-trading-bg-tertiary transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>

        {/* Sidebar content */}
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            <Watchlist />
          </div>
        )}
      </div>
    </aside>
  )
}
