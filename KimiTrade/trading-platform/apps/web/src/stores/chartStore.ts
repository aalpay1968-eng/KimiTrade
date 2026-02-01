import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Timeframe, ChartType } from '@types/chart'

export interface ChartState {
  // Current symbol
  symbol: string
  setSymbol: (symbol: string) => void

  // Timeframe
  timeframe: Timeframe
  setTimeframe: (timeframe: Timeframe) => void

  // Chart type
  chartType: ChartType
  setChartType: (chartType: ChartType) => void

  // Price scale
  priceScaleMode: 'normal' | 'logarithmic' | 'percentage'
  setPriceScaleMode: (mode: 'normal' | 'logarithmic' | 'percentage') => void

  // UI state
  showVolume: boolean
  toggleVolume: () => void
  
  showGrid: boolean
  toggleGrid: () => void
  
  showCrosshair: boolean
  toggleCrosshair: () => void

  // Theme
  theme: 'dark' | 'light'
  toggleTheme: () => void

  // Indicators
  indicators: IndicatorConfig[]
  addIndicator: (indicator: IndicatorConfig) => void
  removeIndicator: (id: string) => void
  updateIndicator: (id: string, config: Partial<IndicatorConfig>) => void

  // Drawings
  drawings: Drawing[]
  addDrawing: (drawing: Drawing) => void
  removeDrawing: (id: string) => void

  // Layout
  layout: ChartLayout
  updateLayout: (layout: Partial<ChartLayout>) => void

  // Reset
  reset: () => void
}

export interface IndicatorConfig {
  id: string
  type: string
  name: string
  params: Record<string, number | string | boolean>
  visible: boolean
  pane: number
  style?: {
    color?: string
    lineWidth?: number
    lineStyle?: 'solid' | 'dashed' | 'dotted'
  }
}

export interface Drawing {
  id: string
  type: string
  points: { time: number; price: number }[]
  options: Record<string, unknown>
}

export interface ChartLayout {
  panes: PaneConfig[]
  activePane: number
}

export interface PaneConfig {
  id: number
  height: number
  indicators: string[]
}

const defaultIndicators: IndicatorConfig[] = [
  {
    id: 'sma-20',
    type: 'sma',
    name: 'SMA 20',
    params: { period: 20 },
    visible: true,
    pane: 0,
    style: {
      color: '#2962ff',
      lineWidth: 2,
      lineStyle: 'solid',
    },
  },
]

const defaultLayout: ChartLayout = {
  panes: [
    { id: 0, height: 70, indicators: ['sma-20'] },
    { id: 1, height: 30, indicators: ['volume'] },
  ],
  activePane: 0,
}

export const useChartStore = create<ChartState>()(
  persist(
    (set, get) => ({
      // Initial state
      symbol: 'AAPL',
      timeframe: '1D',
      chartType: 'candlestick',
      priceScaleMode: 'normal',
      showVolume: true,
      showGrid: true,
      showCrosshair: true,
      theme: 'dark',
      indicators: defaultIndicators,
      drawings: [],
      layout: defaultLayout,

      // Actions
      setSymbol: (symbol) => set({ symbol }),
      
      setTimeframe: (timeframe) => set({ timeframe }),
      
      setChartType: (chartType) => set({ chartType }),
      
      setPriceScaleMode: (mode) => set({ priceScaleMode: mode }),
      
      toggleVolume: () => set((state) => ({ showVolume: !state.showVolume })),
      
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      
      toggleCrosshair: () => set((state) => ({ showCrosshair: !state.showCrosshair })),
      
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      addIndicator: (indicator) =>
        set((state) => ({
          indicators: [...state.indicators, indicator],
        })),
      
      removeIndicator: (id) =>
        set((state) => ({
          indicators: state.indicators.filter((i) => i.id !== id),
        })),
      
      updateIndicator: (id, config) =>
        set((state) => ({
          indicators: state.indicators.map((i) =>
            i.id === id ? { ...i, ...config } : i
          ),
        })),
      
      addDrawing: (drawing) =>
        set((state) => ({
          drawings: [...state.drawings, drawing],
        })),
      
      removeDrawing: (id) =>
        set((state) => ({
          drawings: state.drawings.filter((d) => d.id !== id),
        })),
      
      updateLayout: (layout) =>
        set((state) => ({
          layout: { ...state.layout, ...layout },
        })),
      
      reset: () =>
        set({
          symbol: 'AAPL',
          timeframe: '1D',
          chartType: 'candlestick',
          priceScaleMode: 'normal',
          showVolume: true,
          showGrid: true,
          showCrosshair: true,
          theme: 'dark',
          indicators: defaultIndicators,
          drawings: [],
          layout: defaultLayout,
        }),
    }),
    {
      name: 'chart-storage',
      partialize: (state) => ({
        symbol: state.symbol,
        timeframe: state.timeframe,
        chartType: state.chartType,
        priceScaleMode: state.priceScaleMode,
        showVolume: state.showVolume,
        showGrid: state.showGrid,
        showCrosshair: state.showCrosshair,
        theme: state.theme,
        indicators: state.indicators,
        layout: state.layout,
      }),
    }
  )
)
