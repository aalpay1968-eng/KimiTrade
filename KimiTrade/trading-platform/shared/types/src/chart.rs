//! Chart-related types

use serde::{Deserialize, Serialize};

use crate::Timeframe;

/// Chart type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChartType {
    /// Candlestick chart
    Candlestick,
    /// Bar chart (OHLC)
    Bar,
    /// Line chart (close prices)
    Line,
    /// Area chart
    Area,
    /// Baseline chart
    Baseline,
    /// Heikin Ashi
    HeikinAshi,
    /// Hollow candlesticks
    HollowCandlestick,
    /// Renko
    Renko,
    /// Kagi
    Kagi,
    /// Point & Figure
    PointAndFigure,
    /// Range bars
    RangeBars,
    /// Line break
    LineBreak,
    /// Volume candles
    VolumeCandles,
}

impl ChartType {
    /// Get display name
    pub fn display_name(&self) -> &'static str {
        match self {
            ChartType::Candlestick => "Candlestick",
            ChartType::Bar => "Bar",
            ChartType::Line => "Line",
            ChartType::Area => "Area",
            ChartType::Baseline => "Baseline",
            ChartType::HeikinAshi => "Heikin Ashi",
            ChartType::HollowCandlestick => "Hollow Candlestick",
            ChartType::Renko => "Renko",
            ChartType::Kagi => "Kagi",
            ChartType::PointAndFigure => "Point & Figure",
            ChartType::RangeBars => "Range Bars",
            ChartType::LineBreak => "Line Break",
            ChartType::VolumeCandles => "Volume Candles",
        }
    }

    /// Check if this chart type uses OHLC data
    pub fn uses_ohlc(&self) -> bool {
        matches!(
            self,
            ChartType::Candlestick
                | ChartType::Bar
                | ChartType::HeikinAshi
                | ChartType::HollowCandlestick
                | ChartType::Renko
                | ChartType::Kagi
                | ChartType::PointAndFigure
                | ChartType::RangeBars
                | ChartType::LineBreak
                | ChartType::VolumeCandles
        )
    }

    /// Check if this chart type uses only close prices
    pub fn uses_close_only(&self) -> bool {
        matches!(self, ChartType::Line | ChartType::Area | ChartType::Baseline)
    }
}

impl Default for ChartType {
    fn default() -> Self {
        ChartType::Candlestick
    }
}

/// Chart configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChartConfig {
    /// Chart type
    pub chart_type: ChartType,
    /// Timeframe
    pub timeframe: Timeframe,
    /// Symbol
    pub symbol: String,
    /// Number of bars to show
    pub bar_count: usize,
    /// Price scale mode
    pub price_scale_mode: PriceScaleMode,
    /// Time scale mode
    pub time_scale_mode: TimeScaleMode,
    /// Show volume
    pub show_volume: bool,
    /// Show grid
    pub show_grid: bool,
    /// Show crosshair
    pub show_crosshair: bool,
    /// Theme
    pub theme: ChartTheme,
}

impl Default for ChartConfig {
    fn default() -> Self {
        Self {
            chart_type: ChartType::default(),
            timeframe: Timeframe::OneDay,
            symbol: String::new(),
            bar_count: 100,
            price_scale_mode: PriceScaleMode::default(),
            time_scale_mode: TimeScaleMode::default(),
            show_volume: true,
            show_grid: true,
            show_crosshair: true,
            theme: ChartTheme::default(),
        }
    }
}

/// Price scale mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PriceScaleMode {
    /// Normal linear scale
    Normal,
    /// Logarithmic scale
    Logarithmic,
    /// Percentage scale
    Percentage,
    /// Indexed to 100
    IndexedTo100,
}

impl Default for PriceScaleMode {
    fn default() -> Self {
        PriceScaleMode::Normal
    }
}

/// Time scale mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimeScaleMode {
    /// Regular time scale
    Regular,
    /// Session breaks visible
    SessionBreaks,
    /// Only trading hours
    TradingHours,
}

impl Default for TimeScaleMode {
    fn default() -> Self {
        TimeScaleMode::Regular
    }
}

/// Chart theme
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChartTheme {
    /// Background color
    pub background_color: String,
    /// Grid color
    pub grid_color: String,
    /// Text color
    pub text_color: String,
    /// Border color
    pub border_color: String,
    /// Up candle color
    pub up_color: String,
    /// Down candle color
    pub down_color: String,
    /// Wick color
    pub wick_color: String,
    /// Volume up color
    pub volume_up_color: String,
    /// Volume down color
    pub volume_down_color: String,
    /// Crosshair color
    pub crosshair_color: String,
    /// Line chart color
    pub line_color: String,
    /// Area fill color
    pub area_fill_color: String,
}

impl Default for ChartTheme {
    fn default() -> Self {
        Self {
            background_color: "#131722".to_string(),
            grid_color: "#2a2e39".to_string(),
            text_color: "#d1d4dc".to_string(),
            border_color: "#2a2e39".to_string(),
            up_color: "#26a69a".to_string(),
            down_color: "#ef5350".to_string(),
            wick_color: "#787b86".to_string(),
            volume_up_color: "#26a69a".to_string(),
            volume_down_color: "#ef5350".to_string(),
            crosshair_color: "#758696".to_string(),
            line_color: "#2962FF".to_string(),
            area_fill_color: "rgba(41, 98, 255, 0.28)".to_string(),
        }
    }
}

/// Chart viewport (visible area)
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Viewport {
    /// Left position (time)
    pub from: i64,
    /// Right position (time)
    pub to: i64,
    /// Bottom price
    pub bottom: f64,
    /// Top price
    pub top: f64,
}

impl Viewport {
    /// Create a new viewport
    pub fn new(from: i64, to: i64, bottom: f64, top: f64) -> Self {
        Self {
            from,
            to,
            bottom,
            top,
        }
    }

    /// Get the time range
    pub fn time_range(&self) -> i64 {
        self.to - self.from
    }

    /// Get the price range
    pub fn price_range(&self) -> f64 {
        self.top - self.bottom
    }

    /// Check if a point is visible
    pub fn contains(&self, time: i64, price: f64) -> bool {
        time >= self.from && time <= self.to && price >= self.bottom && price <= self.top
    }

    /// Scale the viewport
    pub fn scale(&mut self, factor: f64, center_time: i64, center_price: f64) {
        let time_range = self.time_range() as f64 * factor;
        let price_range = self.price_range() * factor;
        
        self.from = center_time - (time_range / 2.0) as i64;
        self.to = center_time + (time_range / 2.0) as i64;
        self.bottom = center_price - price_range / 2.0;
        self.top = center_price + price_range / 2.0;
    }
}

/// Drawing tool type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DrawingTool {
    /// Trend line
    TrendLine,
    /// Horizontal line
    HorizontalLine,
    /// Vertical line
    VerticalLine,
    /// Cross line
    CrossLine,
    /// Ray
    Ray,
    /// Extended line
    ExtendedLine,
    /// Parallel channel
    ParallelChannel,
    /// Fibonacci retracement
    FibonacciRetracement,
    /// Fibonacci extension
    FibonacciExtension,
    /// Fibonacci fan
    FibonacciFan,
    /// Fibonacci arc
    FibonacciArc,
    /// Fibonacci timezone
    FibonacciTimezone,
    /// Gann fan
    GannFan,
    /// Gann grid
    GannGrid,
    /// Andrew's pitchfork
    Pitchfork,
    /// Rectangle
    Rectangle,
    /// Rotated rectangle
    RotatedRectangle,
    /// Circle
    Circle,
    /// Ellipse
    Ellipse,
    /// Triangle
    Triangle,
    /// Polyline
    Polyline,
    /// Curve
    Curve,
    /// Text
    Text,
    /// Arrow
    Arrow,
    /// Arrow marker
    ArrowMarker,
    /// Range tool
    RangeTool,
    /// Measure tool
    MeasureTool,
    /// Brush
    Brush,
    /// Highlighter
    Highlighter,
    /// Magnet
    Magnet,
}

/// Drawing object
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Drawing {
    /// Drawing ID
    pub id: String,
    /// Tool type
    pub tool: DrawingTool,
    /// Points defining the drawing
    pub points: Vec<DrawingPoint>,
    /// Drawing options
    pub options: DrawingOptions,
    /// Is visible
    pub visible: bool,
    /// Z-index
    pub z_index: i32,
}

/// Drawing point
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrawingPoint {
    /// Time (x-coordinate)
    pub time: i64,
    /// Price (y-coordinate)
    pub price: f64,
}

/// Drawing options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrawingOptions {
    /// Line color
    pub color: String,
    /// Line width
    pub line_width: f32,
    /// Line style
    pub line_style: LineStyle,
    /// Fill color (for shapes)
    pub fill_color: Option<String>,
    /// Text (for text tool)
    pub text: Option<String>,
    /// Font size
    pub font_size: Option<u32>,
    /// Show price label
    pub show_price_label: bool,
    /// Show time label
    pub show_time_label: bool,
}

/// Line style
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LineStyle {
    /// Solid line
    Solid,
    /// Dashed line
    Dashed,
    /// Dotted line
    Dotted,
    /// Dash-dot line
    DashDot,
}

impl Default for LineStyle {
    fn default() -> Self {
        LineStyle::Solid
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chart_type_display_name() {
        assert_eq!(ChartType::Candlestick.display_name(), "Candlestick");
        assert_eq!(ChartType::Line.display_name(), "Line");
    }

    #[test]
    fn test_chart_type_uses_ohlc() {
        assert!(ChartType::Candlestick.uses_ohlc());
        assert!(!ChartType::Line.uses_ohlc());
    }

    #[test]
    fn test_viewport_contains() {
        let viewport = Viewport::new(0, 100, 0.0, 100.0);
        assert!(viewport.contains(50, 50.0));
        assert!(!viewport.contains(150, 50.0));
        assert!(!viewport.contains(50, 150.0));
    }

    #[test]
    fn test_viewport_scale() {
        let mut viewport = Viewport::new(0, 100, 0.0, 100.0);
        viewport.scale(2.0, 50, 50.0);
        assert_eq!(viewport.time_range(), 200);
        assert_eq!(viewport.price_range(), 200.0);
    }
}
