import {
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

import { useChartStore } from '@stores/chartStore'

export function ChartToolbar() {
  const { showVolume, toggleVolume, showGrid, toggleGrid, showCrosshair, toggleCrosshair } = useChartStore()

  const buttons = [
    { icon: <CursorArrowRaysIcon className="w-4 h-4" />, label: 'Cursor', active: true, onClick: () => {} },
    { icon: <MagnifyingGlassPlusIcon className="w-4 h-4" />, label: 'Zoom In', onClick: () => {} },
    { icon: <MagnifyingGlassMinusIcon className="w-4 h-4" />, label: 'Zoom Out', onClick: () => {} },
    { icon: <ArrowsPointingOutIcon className="w-4 h-4" />, label: 'Fit', onClick: () => {} },
  ]

  const toggles = [
    { label: 'Volume', active: showVolume, onClick: toggleVolume },
    { label: 'Grid', active: showGrid, onClick: toggleGrid },
    { label: 'Crosshair', active: showCrosshair, onClick: toggleCrosshair },
  ]

  return (
    <div className="flex items-center gap-1">
      {buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          className={`p-1.5 rounded hover:bg-trading-bg-tertiary transition-colors ${
            btn.active ? 'text-trading-accent' : 'text-gray-400'
          }`}
          title={btn.label}
        >
          {btn.icon}
        </button>
      ))}
      
      <div className="w-px h-5 bg-trading-border mx-1" />
      
      {toggles.map((toggle) => (
        <button
          key={toggle.label}
          onClick={toggle.onClick}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            toggle.active
              ? 'bg-trading-accent text-white'
              : 'text-gray-400 hover:bg-trading-bg-tertiary'
          }`}
        >
          {toggle.label}
        </button>
      ))}
      
      <button className="p-1.5 rounded hover:bg-trading-bg-tertiary transition-colors text-gray-400">
        <Cog6ToothIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
