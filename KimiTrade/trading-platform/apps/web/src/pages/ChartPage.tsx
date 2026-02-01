import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'

import { getOHLCV } from '@lib/api'
import { useChartStore } from '@stores/chartStore'
import { ChartToolbar } from '@components/ChartToolbar'
import { TimeframeSelector } from '@components/TimeframeSelector'
import { ChartTypeSelector } from '@components/ChartTypeSelector'
import { IndicatorPanel } from '@components/IndicatorPanel'
import { DrawingToolbar } from '@components/DrawingToolbar'

export default function ChartPage() {
  const { symbol: paramSymbol } = useParams()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  const {
    symbol: storeSymbol,
    setSymbol,
    timeframe,
    chartType,
    showVolume,
    showGrid,
    theme,
  } = useChartStore()

  const symbol = paramSymbol || storeSymbol

  // Update store symbol when URL changes
  useEffect(() => {
    if (paramSymbol && paramSymbol !== storeSymbol) {
      setSymbol(paramSymbol)
    }
  }, [paramSymbol, storeSymbol, setSymbol])

  // Fetch OHLCV data
  const { data: ohlcvData = [], isLoading } = useQuery({
    queryKey: ['ohlcv', symbol, timeframe],
    queryFn: () => getOHLCV(symbol, timeframe),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: theme === 'dark' ? '#131722' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d4dc' : '#131722',
      },
      grid: {
        vertLines: { color: showGrid ? '#2a2e39' : 'transparent' },
        horzLines: { color: showGrid ? '#2a2e39' : 'transparent' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#787b86',
      wickDownColor: '#787b86',
    })

    candlestickSeriesRef.current = candlestickSeries

    // Create volume series (if enabled)
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      })
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })
      volumeSeriesRef.current = volumeSeries
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      candlestickSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [showVolume, showGrid, theme])

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || ohlcvData.length === 0) return

    const chartData: CandlestickData[] = ohlcvData.map((d) => ({
      time: (d.timestamp / 1000) as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    candlestickSeriesRef.current.setData(chartData)

    // Update volume data
    if (volumeSeriesRef.current && showVolume) {
      const volumeData = ohlcvData.map((d) => ({
        time: (d.timestamp / 1000) as Time,
        value: d.volume,
        color: d.close >= d.open ? '#26a69a80' : '#ef535080',
      }))
      volumeSeriesRef.current.setData(volumeData)
    }

    // Fit content
    chartRef.current?.timeScale().fitContent()
  }, [ohlcvData, showVolume])

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 p-2 bg-trading-bg-secondary border-b border-trading-border">
        <ChartTypeSelector />
        <TimeframeSelector />
        <div className="w-px h-6 bg-trading-border mx-2" />
        <ChartToolbar />
        <div className="w-px h-6 bg-trading-border mx-2" />
        <DrawingToolbar />
      </div>

      {/* Chart area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chart */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-trading-bg-primary bg-opacity-80 z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-trading-accent border-t-transparent rounded-full spinner" />
                <span className="text-gray-400">Loading...</span>
              </div>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>

        {/* Right panel */}
        <div className="w-64 bg-trading-bg-secondary border-l border-trading-border overflow-y-auto">
          <IndicatorPanel />
        </div>
      </div>
    </div>
  )
}
