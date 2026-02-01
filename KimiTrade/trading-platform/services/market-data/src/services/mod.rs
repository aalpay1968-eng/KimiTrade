//! Service layer for market data operations

use std::sync::Arc;

use dashmap::DashMap;
use moka::future::Cache;
use redis::aio::MultiplexedConnection;
use sqlx::PgPool;
use tokio::sync::broadcast;
use tracing::{debug, error, info, warn};

use crate::{
    config::Config,
    error::{AppError, Result},
};
use trading_types::{
    market_data::{OHLCV, OrderBook, Quote, Symbol, Tick},
    Pagination, PaginatedResponse, Timeframe,
};

mod providers;
pub use providers::*;

/// Market Data Service
#[derive(Clone)]
pub struct MarketDataService {
    /// Configuration
    config: Config,
    /// Database connection pool
    db_pool: PgPool,
    /// Redis connection
    redis: MultiplexedConnection,
    /// Quote cache
    quote_cache: Cache<String, Quote>,
    /// OHLCV cache
    ohlcv_cache: Cache<String, Vec<OHLCV>>,
    /// Order book cache
    orderbook_cache: Cache<String, OrderBook>,
    /// Symbol cache
    symbol_cache: Arc<DashMap<String, Symbol>>,
    /// Price update broadcast channel
    price_tx: broadcast::Sender<PriceUpdate>,
}

/// Price update event
#[derive(Debug, Clone)]
pub struct PriceUpdate {
    /// Symbol
    pub symbol: String,
    /// New price
    pub price: f64,
    /// Timestamp
    pub timestamp: i64,
}

impl MarketDataService {
    /// Create a new market data service
    pub async fn new(config: Config) -> Result<Self> {
        info!("Initializing Market Data Service...");

        // Initialize database connection
        let db_pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(10)
            .connect(&config.database_url)
            .await
            .map_err(|e| AppError::Database(e))?;

        info!("Database connection established");

        // Initialize Redis connection
        let redis_client = redis::Client::open(config.redis_url.clone())
            .map_err(|e| AppError::Redis(e))?;
        let redis = redis_client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| AppError::Redis(e))?;

        info!("Redis connection established");

        // Initialize caches
        let quote_cache = Cache::builder()
            .max_capacity(10000)
            .time_to_live(std::time::Duration::from_secs(config.cache.quote_ttl))
            .build();

        let ohlcv_cache = Cache::builder()
            .max_capacity(1000)
            .time_to_live(std::time::Duration::from_secs(config.cache.ohlcv_ttl))
            .build();

        let orderbook_cache = Cache::builder()
            .max_capacity(5000)
            .time_to_live(std::time::Duration::from_secs(config.cache.orderbook_ttl))
            .build();

        // Initialize broadcast channel
        let (price_tx, _) = broadcast::channel(10000);

        Ok(Self {
            config,
            db_pool,
            redis,
            quote_cache,
            ohlcv_cache,
            orderbook_cache,
            symbol_cache: Arc::new(DashMap::new()),
            price_tx,
        })
    }

    /// List all available symbols
    pub async fn list_symbols(&self, pagination: Pagination) -> Result<PaginatedResponse<Symbol>> {
        let offset = (pagination.page * pagination.limit) as i64;
        let limit = pagination.limit as i64;

        let rows = sqlx::query_as::<_, SymbolRow>(
            r#"
            SELECT id, ticker, name, exchange, instrument_type, currency,
                   price_precision, quantity_precision, min_quantity, max_quantity,
                   lot_size, is_active
            FROM symbols
            WHERE is_active = true
            ORDER BY ticker
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| AppError::Database(e))?;

        let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM symbols WHERE is_active = true")
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| AppError::Database(e))?;

        let symbols: Vec<Symbol> = rows.into_iter().map(|r| r.into()).collect();

        Ok(PaginatedResponse::new(
            symbols,
            total as u64,
            pagination.page,
            pagination.limit,
        ))
    }

    /// Get symbol details
    pub async fn get_symbol(&self, ticker: &str) -> Result<Option<Symbol>> {
        // Check cache first
        if let Some(symbol) = self.symbol_cache.get(ticker) {
            return Ok(Some(symbol.clone()));
        }

        let row = sqlx::query_as::<_, SymbolRow>(
            r#"
            SELECT id, ticker, name, exchange, instrument_type, currency,
                   price_precision, quantity_precision, min_quantity, max_quantity,
                   lot_size, is_active
            FROM symbols
            WHERE ticker = $1
            "#,
        )
        .bind(ticker)
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| AppError::Database(e))?;

        if let Some(row) = row {
            let symbol: Symbol = row.into();
            self.symbol_cache.insert(ticker.to_string(), symbol.clone());
            Ok(Some(symbol))
        } else {
            Ok(None)
        }
    }

    /// Get current quote for a symbol
    pub async fn get_quote(&self, symbol: &str) -> Result<Option<Quote>> {
        // Check cache first
        if let Some(quote) = self.quote_cache.get(symbol).await {
            debug!("Quote cache hit for {}", symbol);
            return Ok(Some(quote));
        }

        // TODO: Fetch from provider or database
        // For now, return mock data
        let quote = Quote {
            symbol: symbol.to_string(),
            bid: 150.0,
            ask: 150.05,
            bid_size: 1000.0,
            ask_size: 1000.0,
            last_price: 150.02,
            last_size: 100.0,
            volume: 1000000.0,
            timestamp: chrono::Utc::now(),
            change: 1.5,
            change_percent: 1.01,
        };

        // Cache the quote
        self.quote_cache.insert(symbol.to_string(), quote.clone()).await;

        Ok(Some(quote))
    }

    /// Get OHLCV data for a symbol
    pub async fn get_ohlcv(
        &self,
        symbol: &str,
        timeframe: Timeframe,
        from: Option<i64>,
        to: Option<i64>,
        limit: usize,
    ) -> Result<Vec<OHLCV>> {
        let cache_key = format!("{}:{}:{:?}:{:?}:{}", symbol, timeframe, from, to, limit);

        // Check cache first
        if let Some(ohlcv) = self.ohlcv_cache.get(&cache_key).await {
            debug!("OHLCV cache hit for {}", symbol);
            return Ok(ohlcv);
        }

        // Build query
        let mut query = String::from(
            r#"
            SELECT open, high, low, close, volume, timestamp
            FROM ohlcv
            WHERE symbol = $1 AND timeframe = $2
            "#,
        );

        if from.is_some() {
            query.push_str(" AND timestamp >= $3");
        }
        if to.is_some() {
            query.push_str(" AND timestamp <= $4");
        }

        query.push_str(" ORDER BY timestamp DESC LIMIT $5");

        // Execute query
        let rows = sqlx::query_as::<_, OHLCVRow>(&query)
            .bind(symbol)
            .bind(timeframe.as_str())
            .bind(from)
            .bind(to)
            .bind(limit as i64)
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| AppError::Database(e))?;

        let ohlcv: Vec<OHLCV> = rows.into_iter().map(|r| r.into()).rev().collect();

        // Cache the result
        self.ohlcv_cache.insert(cache_key, ohlcv.clone()).await;

        Ok(ohlcv)
    }

    /// Get recent trades for a symbol
    pub async fn get_trades(
        &self,
        symbol: &str,
        from: Option<i64>,
        to: Option<i64>,
        limit: usize,
    ) -> Result<Vec<Tick>> {
        // TODO: Implement trade fetching
        // For now, return empty
        Ok(vec![])
    }

    /// Get order book for a symbol
    pub async fn get_orderbook(&self, symbol: &str) -> Result<Option<OrderBook>> {
        // Check cache first
        if let Some(orderbook) = self.orderbook_cache.get(symbol).await {
            debug!("Order book cache hit for {}", symbol);
            return Ok(Some(orderbook));
        }

        // TODO: Fetch from provider or database
        // For now, return mock data
        let orderbook = OrderBook {
            symbol: symbol.to_string(),
            bids: vec![
                trading_types::market_data::OrderBookLevel::new(150.0, 1000.0),
                trading_types::market_data::OrderBookLevel::new(149.99, 2000.0),
                trading_types::market_data::OrderBookLevel::new(149.98, 1500.0),
            ],
            asks: vec![
                trading_types::market_data::OrderBookLevel::new(150.01, 1000.0),
                trading_types::market_data::OrderBookLevel::new(150.02, 2000.0),
                trading_types::market_data::OrderBookLevel::new(150.03, 1500.0),
            ],
            timestamp: chrono::Utc::now(),
            sequence: None,
        };

        // Cache the order book
        self.orderbook_cache.insert(symbol.to_string(), orderbook.clone()).await;

        Ok(Some(orderbook))
    }

    /// Subscribe to price updates
    pub fn subscribe_prices(&self) -> broadcast::Receiver<PriceUpdate> {
        self.price_tx.subscribe()
    }

    /// Publish a price update
    pub fn publish_price(&self, update: PriceUpdate) {
        let _ = self.price_tx.send(update);
    }
}

/// Symbol row from database
#[derive(sqlx::FromRow)]
struct SymbolRow {
    id: uuid::Uuid,
    ticker: String,
    name: String,
    exchange: String,
    instrument_type: String,
    currency: String,
    price_precision: i16,
    quantity_precision: i16,
    min_quantity: Option<f64>,
    max_quantity: Option<f64>,
    lot_size: Option<f64>,
    is_active: bool,
}

impl From<SymbolRow> for Symbol {
    fn from(row: SymbolRow) -> Self {
        Self {
            id: row.id,
            ticker: row.ticker,
            name: row.name,
            exchange: row.exchange,
            instrument_type: match row.instrument_type.as_str() {
                "stock" => trading_types::market_data::InstrumentType::Stock,
                "etf" => trading_types::market_data::InstrumentType::Etf,
                "forex" => trading_types::market_data::InstrumentType::Forex,
                "crypto" => trading_types::market_data::InstrumentType::Crypto,
                "futures" => trading_types::market_data::InstrumentType::Futures,
                "options" => trading_types::market_data::InstrumentType::Options,
                "bond" => trading_types::market_data::InstrumentType::Bond,
                "commodity" => trading_types::market_data::InstrumentType::Commodity,
                "index" => trading_types::market_data::InstrumentType::Index,
                "cfd" => trading_types::market_data::InstrumentType::Cfd,
                _ => trading_types::market_data::InstrumentType::Stock,
            },
            currency: row.currency,
            price_precision: row.price_precision as u8,
            quantity_precision: row.quantity_precision as u8,
            min_quantity: row.min_quantity,
            max_quantity: row.max_quantity,
            lot_size: row.lot_size,
            is_active: row.is_active,
        }
    }
}

/// OHLCV row from database
#[derive(sqlx::FromRow)]
struct OHLCVRow {
    open: f64,
    high: f64,
    low: f64,
    close: f64,
    volume: f64,
    timestamp: chrono::DateTime<chrono::Utc>,
}

impl From<OHLCVRow> for OHLCV {
    fn from(row: OHLCVRow) -> Self {
        Self {
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: row.volume,
            timestamp: row.timestamp,
        }
    }
}
