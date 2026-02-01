import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChartBarIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

import { SymbolSearch } from './SymbolSearch'
import { useChartStore } from '@stores/chartStore'

export function Header() {
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const { symbol, setSymbol } = useChartStore()

  const handleSymbolSelect = (selectedSymbol: string) => {
    setSymbol(selectedSymbol)
    setShowSearch(false)
  }

  return (
    <header className="h-12 bg-trading-bg-secondary border-b border-trading-border flex items-center px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mr-6">
        <ChartBarIcon className="w-6 h-6 text-trading-accent" />
        <span className="font-bold text-lg">TradingPlatform</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-1 mr-auto">
        <NavLink to="/" icon={<ChartBarIcon className="w-4 h-4" />} label="Chart" active={location.pathname === '/'} />
        <NavLink to="/watchlist" icon={<ListBulletIcon className="w-4 h-4" />} label="Watchlist" active={location.pathname === '/watchlist'} />
        <NavLink to="/screener" icon={<MagnifyingGlassIcon className="w-4 h-4" />} label="Screener" active={location.pathname === '/screener'} />
      </nav>

      {/* Symbol Search */}
      <div className="relative mx-4">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-3 py-1.5 bg-trading-bg-tertiary rounded hover:bg-gray-700 transition-colors"
        >
          <span className="font-mono font-medium">{symbol}</span>
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
        </button>
        {showSearch && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <SymbolSearch onSelect={handleSymbolSelect} onClose={() => setShowSearch(false)} />
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-trading-bg-tertiary rounded transition-colors">
          <BellIcon className="w-5 h-5" />
        </button>
        <Link to="/settings" className="p-2 hover:bg-trading-bg-tertiary rounded transition-colors">
          <Cog6ToothIcon className="w-5 h-5" />
        </Link>
        <button className="p-2 hover:bg-trading-bg-tertiary rounded transition-colors">
          <UserCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

interface NavLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  active: boolean
}

function NavLink({ to, icon, label, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
        active
          ? 'bg-trading-accent text-white'
          : 'text-gray-400 hover:text-white hover:bg-trading-bg-tertiary'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  )
}
