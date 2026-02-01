//! HTTP request handlers

use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use std::sync::Arc;
use tracing::{debug, info};

use crate::{
    error::{AppError, Result},
    AppState,
};
use trading_types::{
    market_data::{OHLCV, OrderBook, Quote, Symbol, Tick},
    ApiResponse, Pagination, PaginatedResponse, Timeframe,
};

mod websocket;
pub use websocket::*;

/// Query parameters for OHLCV data
#[derive(Debug, Deserialize)]
pub struct OHLCVQuery {
    /// Timeframe
    #[serde(default = "default_timeframe")]
    pub timeframe: Timeframe,
    /// Start timestamp
    pub from: Option<i64>,
    /// End timestamp
    pub to: Option<i64>,
    /// Number of bars
    #[serde(default = "default_limit")]
    pub limit: usize,
}

fn default_timeframe() -> Timeframe {
    Timeframe::OneDay
}

fn default_limit() -> usize {
    100
}

/// Query parameters for trades
#[derive(Debug, Deserialize)]
pub struct TradesQuery {
    /// Start timestamp
    pub from: Option<i64>,
    /// End timestamp
    pub to: Option<i64>,
    /// Number of trades
    #[serde(default = "default_limit")]
    pub limit: usize,
}

/// List all available symbols
pub async fn list_symbols(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<ApiResponse<PaginatedResponse<Symbol>>>> {
    info!("Listing symbols: page={}, limit={}", pagination.page, pagination.limit);

    let symbols = state
        .market_data_service
        .list_symbols(pagination)
        .await?;

    Ok(Json(ApiResponse::success(symbols)))
}

/// Get symbol details
pub async fn get_symbol(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> Result<Json<ApiResponse<Symbol>>> {
    debug!("Getting symbol: {}", symbol);

    let symbol_data = state
        .market_data_service
        .get_symbol(&symbol)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Symbol not found: {}", symbol)))?;

    Ok(Json(ApiResponse::success(symbol_data)))
}

/// Get current quote for a symbol
pub async fn get_quote(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> Result<Json<ApiResponse<Quote>>> {
    debug!("Getting quote for: {}", symbol);

    let quote = state
        .market_data_service
        .get_quote(&symbol)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Quote not found for: {}", symbol)))?;

    Ok(Json(ApiResponse::success(quote)))
}

/// Get OHLCV data for a symbol
pub async fn get_ohlcv(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(query): Query<OHLCVQuery>,
) -> Result<Json<ApiResponse<Vec<OHLCV>>>> {
    info!(
        "Getting OHLCV for {}: timeframe={}, limit={}",
        symbol, query.timeframe, query.limit
    );

    let ohlcv = state
        .market_data_service
        .get_ohlcv(&symbol, query.timeframe, query.from, query.to, query.limit)
        .await?;

    Ok(Json(ApiResponse::success(ohlcv)))
}

/// Get recent trades for a symbol
pub async fn get_trades(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(query): Query<TradesQuery>,
) -> Result<Json<ApiResponse<Vec<Tick>>>> {
    debug!("Getting trades for {}: limit={}", symbol, query.limit);

    let trades = state
        .market_data_service
        .get_trades(&symbol, query.from, query.to, query.limit)
        .await?;

    Ok(Json(ApiResponse::success(trades)))
}

/// Get order book for a symbol
pub async fn get_orderbook(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> Result<Json<ApiResponse<OrderBook>>> {
    debug!("Getting order book for: {}", symbol);

    let orderbook = state
        .market_data_service
        .get_orderbook(&symbol)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Order book not found for: {}", symbol)))?;

    Ok(Json(ApiResponse::success(orderbook)))
}
