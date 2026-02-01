// Chart types

export type Timeframe =
  | '1s' | '5s' | '15s' | '30s'
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h'
  | '1D' | '1W' | '1M'

export type ChartType =
  | 'candlestick'
  | 'bar'
  | 'line'
  | 'area'
  | 'baseline'
  | 'heikinAshi'
  | 'hollowCandlestick'
  | 'renko'
  | 'kagi'
  | 'pointAndFigure'
  | 'rangeBars'
  | 'lineBreak'
  | 'volumeCandles'

export interface ChartConfig {
  chartType: ChartType
  timeframe: Timeframe
  symbol: string
  barCount: number
  priceScaleMode: 'normal' | 'logarithmic' | 'percentage' | 'indexedTo100'
  timeScaleMode: 'regular' | 'sessionBreaks' | 'tradingHours'
  showVolume: boolean
  showGrid: boolean
  showCrosshair: boolean
  theme: ChartTheme
}

export interface ChartTheme {
  backgroundColor: string
  gridColor: string
  textColor: string
  borderColor: string
  upColor: string
  downColor: string
  wickColor: string
  volumeUpColor: string
  volumeDownColor: string
  crosshairColor: string
  lineColor: string
  areaFillColor: string
}

export interface Viewport {
  from: number
  to: number
  bottom: number
  top: number
}

export type DrawingTool =
  | 'trendLine'
  | 'horizontalLine'
  | 'verticalLine'
  | 'crossLine'
  | 'ray'
  | 'extendedLine'
  | 'parallelChannel'
  | 'fibonacciRetracement'
  | 'fibonacciExtension'
  | 'fibonacciFan'
  | 'fibonacciArc'
  | 'fibonacciTimezone'
  | 'gannFan'
  | 'gannGrid'
  | 'pitchfork'
  | 'rectangle'
  | 'rotatedRectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'polyline'
  | 'curve'
  | 'text'
  | 'arrow'
  | 'arrowMarker'
  | 'rangeTool'
  | 'measureTool'
  | 'brush'
  | 'highlighter'
  | 'magnet'

export interface Drawing {
  id: string
  tool: DrawingTool
  points: DrawingPoint[]
  options: DrawingOptions
  visible: boolean
  zIndex: number
}

export interface DrawingPoint {
  time: number
  price: number
}

export interface DrawingOptions {
  color: string
  lineWidth: number
  lineStyle: 'solid' | 'dashed' | 'dotted'
  fillColor?: string
  text?: string
  fontSize?: number
  showPriceLabel: boolean
  showTimeLabel: boolean
}
