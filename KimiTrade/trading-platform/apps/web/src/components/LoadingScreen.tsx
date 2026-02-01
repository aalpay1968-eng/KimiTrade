import { ChartBarIcon } from '@heroicons/react/24/outline'

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-trading-bg-primary">
      <div className="flex items-center gap-3 mb-4">
        <ChartBarIcon className="w-10 h-10 text-trading-accent" />
        <span className="text-2xl font-bold">TradingPlatform</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-trading-accent border-t-transparent rounded-full spinner" />
        <span className="text-gray-400">Loading...</span>
      </div>
    </div>
  )
}
