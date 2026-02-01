//! Market Data Service
//! 
//! This service provides real-time and historical market data
//! including quotes, trades, order books, and OHLCV data.

use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    routing::{get, post},
    Router,
};
use tokio::net::TcpListener;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::{info, Level};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod error;
mod handlers;
mod models;
mod services;
mod websocket;

use config::Config;
use error::AppError;
use handlers::*;
use services::MarketDataService;
use websocket::WebSocketHandler;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "market_data=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting Market Data Service...");

    // Load configuration
    let config = Config::from_env()?;
    info!("Configuration loaded successfully");

    // Initialize services
    let market_data_service = Arc::new(MarketDataService::new(config.clone()).await?);
    info!("Market Data Service initialized");

    // Initialize WebSocket handler
    let ws_handler = Arc::new(WebSocketHandler::new(market_data_service.clone()));

    // Build router
    let app = create_router(market_data_service, ws_handler);

    // Start server
    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;
    info!("Server listening on {}", addr);

    let listener = TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn create_router(
    market_data_service: Arc<MarketDataService>,
    ws_handler: Arc<WebSocketHandler>,
) -> Router {
    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Health check
        .route("/health", get(health_check))
        .route("/ready", get(readiness_check))
        // Market data endpoints
        .route("/api/v1/symbols", get(list_symbols))
        .route("/api/v1/symbols/:symbol", get(get_symbol))
        .route("/api/v1/symbols/:symbol/quote", get(get_quote))
        .route("/api/v1/symbols/:symbol/ohlcv", get(get_ohlcv))
        .route("/api/v1/symbols/:symbol/trades", get(get_trades))
        .route("/api/v1/symbols/:symbol/orderbook", get(get_orderbook))
        // WebSocket endpoint
        .route("/ws", get(websocket::handle_ws))
        // Metrics endpoint
        .route("/metrics", get(metrics_handler))
        // Layers
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        // State
        .with_state(AppState {
            market_data_service,
            ws_handler,
        })
}

/// Application state shared across handlers
#[derive(Clone)]
pub struct AppState {
    pub market_data_service: Arc<MarketDataService>,
    pub ws_handler: Arc<WebSocketHandler>,
}

/// Health check handler
async fn health_check() -> &'static str {
    "OK"
}

/// Readiness check handler
async fn readiness_check() -> &'static str {
    "OK"
}

/// Metrics handler
async fn metrics_handler() -> Result<String, AppError> {
    let encoder = metrics_exporter_prometheus::PrometheusBuilder::new().build();
    // This is a simplified version; in production, use proper metrics collection
    Ok("# HELP market_data_requests_total Total requests\n# TYPE market_data_requests_total counter\nmarket_data_requests_total 0\n".to_string())
}
