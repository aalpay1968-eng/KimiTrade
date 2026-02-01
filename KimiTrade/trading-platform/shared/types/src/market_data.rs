//! Market data types

use chrono::{DateTime, Utc};
use decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::{Id, Timestamp};

/// OHLCV (Open, High, Low, Close, Volume) data point
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OHLCV {
    /// Opening price
    pub open: f64,
    /// Highest price
    pub high: f64,
    /// Lowest price
    pub low: f64,
    /// Closing price
    pub close: f64,
    /// Trading volume
    pub volume: f64,
    /// Timestamp
    pub timestamp: Timestamp,
}

impl OHLCV {
    /// Create a new OHLCV data point
    pub fn new(open: f64, high: f64, low: f64, close: f64, volume: f64, timestamp: Timestamp) -> Self {
        Self {
            open,
            high,
            low,
            close,
            volume,
            timestamp,
        }
    }

    /// Get the average price (typical price)
    pub fn typical_price(&self) -> f64 {
        (self.high + self.low + self.close) / 3.0
    }

    /// Get the price range
    pub fn range(&self) -> f64 {
        self.high - self.low
    }

    /// Check if this is a bullish candle
    pub fn is_bullish(&self) -> bool {
        self.close > self.open
    }

    /// Check if this is a bearish candle
    pub fn is_bearish(&self) -> bool {
        self.close < self.open
    }

    /// Get the body size
    pub fn body_size(&self) -> f64 {
        (self.close - self.open).abs()
    }

    /// Get the upper wick size
    pub fn upper_wick(&self) -> f64 {
        self.high - self.open.max(self.close)
    }

    /// Get the lower wick size
    pub fn lower_wick(&self) -> f64 {
        self.open.min(self.close) - self.low
    }
}

/// Real-time tick data
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tick {
    /// Symbol/ticker
    pub symbol: String,
    /// Current price
    pub price: f64,
    /// Trade volume
    pub volume: f64,
    /// Trade timestamp
    pub timestamp: Timestamp,
    /// Exchange where the trade occurred
    pub exchange: String,
    /// Trade ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trade_id: Option<String>,
    /// Bid price
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bid: Option<f64>,
    /// Ask price
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ask: Option<f64>,
    /// Bid size
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bid_size: Option<f64>,
    /// Ask size
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ask_size: Option<f64>,
}

impl Tick {
    /// Create a new tick
    pub fn new(symbol: impl Into<String>, price: f64, volume: f64, exchange: impl Into<String>) -> Self {
        Self {
            symbol: symbol.into(),
            price,
            volume,
            timestamp: Utc::now(),
            exchange: exchange.into(),
            trade_id: None,
            bid: None,
            ask: None,
            bid_size: None,
            ask_size: None,
        }
    }

    /// Set bid/ask prices
    pub fn with_quote(mut self, bid: f64, ask: f64) -> Self {
        self.bid = Some(bid);
        self.ask = Some(ask);
        self
    }

    /// Get the spread
    pub fn spread(&self) -> Option<f64> {
        match (self.ask, self.bid) {
            (Some(ask), Some(bid)) => Some(ask - bid),
            _ => None,
        }
    }

    /// Get the mid price
    pub fn mid_price(&self) -> Option<f64> {
        match (self.ask, self.bid) {
            (Some(ask), Some(bid)) => Some((ask + bid) / 2.0),
            _ => None,
        }
    }
}

/// Order book level (price level)
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderBookLevel {
    /// Price level
    pub price: f64,
    /// Volume at this level
    pub volume: f64,
    /// Number of orders
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order_count: Option<u32>,
}

impl OrderBookLevel {
    /// Create a new order book level
    pub fn new(price: f64, volume: f64) -> Self {
        Self {
            price,
            volume,
            order_count: None,
        }
    }

    /// Create with order count
    pub fn with_count(price: f64, volume: f64, order_count: u32) -> Self {
        Self {
            price,
            volume,
            order_count: Some(order_count),
        }
    }
}

/// Order book snapshot
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderBook {
    /// Symbol/ticker
    pub symbol: String,
    /// Bid levels (sorted by price descending)
    pub bids: Vec<OrderBookLevel>,
    /// Ask levels (sorted by price ascending)
    pub asks: Vec<OrderBookLevel>,
    /// Timestamp
    pub timestamp: Timestamp,
    /// Sequence number for ordering
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sequence: Option<u64>,
}

impl OrderBook {
    /// Create a new order book
    pub fn new(symbol: impl Into<String>) -> Self {
        Self {
            symbol: symbol.into(),
            bids: Vec::new(),
            asks: Vec::new(),
            timestamp: Utc::now(),
            sequence: None,
        }
    }

    /// Get best bid
    pub fn best_bid(&self) -> Option<&OrderBookLevel> {
        self.bids.first()
    }

    /// Get best ask
    pub fn best_ask(&self) -> Option<&OrderBookLevel> {
        self.asks.first()
    }

    /// Get spread
    pub fn spread(&self) -> Option<f64> {
        match (self.best_bid(), self.best_ask()) {
            (Some(bid), Some(ask)) => Some(ask.price - bid.price),
            _ => None,
        }
    }

    /// Get mid price
    pub fn mid_price(&self) -> Option<f64> {
        match (self.best_bid(), self.best_ask()) {
            (Some(bid), Some(ask)) => Some((ask.price + bid.price) / 2.0),
            _ => None,
        }
    }

    /// Get total bid volume
    pub fn total_bid_volume(&self) -> f64 {
        self.bids.iter().map(|l| l.volume).sum()
    }

    /// Get total ask volume
    pub fn total_ask_volume(&self) -> f64 {
        self.asks.iter().map(|l| l.volume).sum()
    }

    /// Get volume imbalance (positive = more bids)
    pub fn volume_imbalance(&self) -> f64 {
        self.total_bid_volume() - self.total_ask_volume()
    }

    /// Calculate depth at a given price level
    pub fn depth_at_price(&self, price: f64, side: Side) -> f64 {
        let levels = match side {
            Side::Buy => &self.bids,
            Side::Sell => &self.asks,
        };
        
        levels
            .iter()
            .filter(|l| match side {
                Side::Buy => l.price >= price,
                Side::Sell => l.price <= price,
            })
            .map(|l| l.volume)
            .sum()
    }
}

/// Trade side
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Side {
    /// Buy side
    Buy,
    /// Sell side
    Sell,
}

impl Side {
    /// Get the opposite side
    pub fn opposite(&self) -> Self {
        match self {
            Side::Buy => Side::Sell,
            Side::Sell => Side::Buy,
        }
    }

    /// Check if buy
    pub fn is_buy(&self) -> bool {
        matches!(self, Side::Buy)
    }

    /// Check if sell
    pub fn is_sell(&self) -> bool {
        matches!(self, Side::Sell)
    }
}

impl std::fmt::Display for Side {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Side::Buy => write!(f, "buy"),
            Side::Sell => write!(f, "sell"),
        }
    }
}

/// Symbol/Instrument information
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Symbol {
    /// Unique ID
    pub id: Id,
    /// Ticker symbol (e.g., "AAPL")
    pub ticker: String,
    /// Full name
    pub name: String,
    /// Exchange
    pub exchange: String,
    /// Instrument type
    pub instrument_type: InstrumentType,
    /// Currency
    pub currency: String,
    /// Price precision (decimal places)
    pub price_precision: u8,
    /// Quantity precision
    pub quantity_precision: u8,
    /// Minimum quantity
    pub min_quantity: Option<f64>,
    /// Maximum quantity
    pub max_quantity: Option<f64>,
    /// Lot size
    pub lot_size: Option<f64>,
    /// Is active
    pub is_active: bool,
}

/// Instrument type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum InstrumentType {
    /// Stock
    Stock,
    /// ETF
    Etf,
    /// Forex pair
    Forex,
    /// Cryptocurrency
    Crypto,
    /// Futures contract
    Futures,
    /// Options contract
    Options,
    /// Bond
    Bond,
    /// Commodity
    Commodity,
    /// Index
    Index,
    /// CFD
    Cfd,
}

/// Quote (best bid/ask)
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    /// Symbol
    pub symbol: String,
    /// Bid price
    pub bid: f64,
    /// Ask price
    pub ask: f64,
    /// Bid size
    pub bid_size: f64,
    /// Ask size
    pub ask_size: f64,
    /// Last price
    pub last_price: f64,
    /// Last size
    pub last_size: f64,
    /// Volume
    pub volume: f64,
    /// Timestamp
    pub timestamp: Timestamp,
    /// Change from previous close
    pub change: f64,
    /// Change percentage
    pub change_percent: f64,
}

impl Quote {
    /// Get the spread
    pub fn spread(&self) -> f64 {
        self.ask - self.bid
    }

    /// Get the mid price
    pub fn mid_price(&self) -> f64 {
        (self.ask + self.bid) / 2.0
    }

    /// Get the spread percentage
    pub fn spread_percent(&self) -> f64 {
        (self.spread() / self.mid_price()) * 100.0
    }
}

/// Trade data
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Trade {
    /// Trade ID
    pub id: String,
    /// Symbol
    pub symbol: String,
    /// Price
    pub price: f64,
    /// Quantity
    pub quantity: f64,
    /// Side (taker's side)
    pub side: Side,
    /// Timestamp
    pub timestamp: Timestamp,
    /// Exchange
    pub exchange: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ohlcv_typical_price() {
        let ohlcv = OHLCV::new(100.0, 110.0, 95.0, 105.0, 1000.0, Utc::now());
        assert_eq!(ohlcv.typical_price(), 105.0);
    }

    #[test]
    fn test_ohlcv_is_bullish() {
        let bullish = OHLCV::new(100.0, 110.0, 95.0, 105.0, 1000.0, Utc::now());
        assert!(bullish.is_bullish());
        
        let bearish = OHLCV::new(100.0, 110.0, 95.0, 95.0, 1000.0, Utc::now());
        assert!(bearish.is_bearish());
    }

    #[test]
    fn test_order_book_spread() {
        let mut book = OrderBook::new("AAPL");
        book.bids.push(OrderBookLevel::new(100.0, 1000.0));
        book.asks.push(OrderBookLevel::new(101.0, 1000.0));
        
        assert_eq!(book.spread(), Some(1.0));
        assert_eq!(book.mid_price(), Some(100.5));
    }

    #[test]
    fn test_quote_spread() {
        let quote = Quote {
            symbol: "AAPL".to_string(),
            bid: 100.0,
            ask: 101.0,
            bid_size: 1000.0,
            ask_size: 1000.0,
            last_price: 100.5,
            last_size: 100.0,
            volume: 10000.0,
            timestamp: Utc::now(),
            change: 1.0,
            change_percent: 1.0,
        };
        
        assert_eq!(quote.spread(), 1.0);
        assert_eq!(quote.mid_price(), 100.5);
    }
}
