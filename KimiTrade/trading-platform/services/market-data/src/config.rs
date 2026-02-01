//! Configuration for Market Data Service

use serde::Deserialize;

/// Application configuration
#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    /// Server host
    pub host: String,
    /// Server port
    pub port: u16,
    /// Database URL
    pub database_url: String,
    /// Redis URL
    pub redis_url: String,
    /// Kafka bootstrap servers
    pub kafka_bootstrap_servers: String,
    /// Log level
    pub log_level: String,
    /// Market data providers
    pub providers: Vec<ProviderConfig>,
    /// WebSocket configuration
    pub websocket: WebSocketConfig,
    /// Cache configuration
    pub cache: CacheConfig,
}

/// Provider configuration
#[derive(Debug, Clone, Deserialize)]
pub struct ProviderConfig {
    /// Provider name
    pub name: String,
    /// Provider type
    pub provider_type: ProviderType,
    /// API key
    pub api_key: Option<String>,
    /// API secret
    pub api_secret: Option<String>,
    /// Base URL
    pub base_url: String,
    /// WebSocket URL
    pub ws_url: Option<String>,
    /// Rate limit (requests per second)
    pub rate_limit: u32,
    /// Enabled
    pub enabled: bool,
}

/// Provider type
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProviderType {
    /// REST API provider
    Rest,
    /// WebSocket provider
    WebSocket,
    /// FIX protocol provider
    Fix,
}

/// WebSocket configuration
#[derive(Debug, Clone, Deserialize)]
pub struct WebSocketConfig {
    /// Maximum connections
    pub max_connections: usize,
    /// Heartbeat interval (seconds)
    pub heartbeat_interval: u64,
    /// Connection timeout (seconds)
    pub connection_timeout: u64,
    /// Message buffer size
    pub message_buffer_size: usize,
    /// Enable compression
    pub enable_compression: bool,
}

/// Cache configuration
#[derive(Debug, Clone, Deserialize)]
pub struct CacheConfig {
    /// Quote cache TTL (seconds)
    pub quote_ttl: u64,
    /// OHLCV cache TTL (seconds)
    pub ohlcv_ttl: u64,
    /// Order book cache TTL (seconds)
    pub orderbook_ttl: u64,
    /// Maximum cache size (MB)
    pub max_size: u64,
}

impl Config {
    /// Load configuration from environment
    pub fn from_env() -> anyhow::Result<Self> {
        dotenvy::dotenv().ok();

        let config = config::Config::builder()
            .add_source(config::Environment::default().separator("__"))
            .set_default("host", "0.0.0.0")?
            .set_default("port", 8080)?
            .set_default("log_level", "info")?
            .set_default("redis_url", "redis://localhost:6379")?
            .set_default("kafka_bootstrap_servers", "localhost:9092")?
            .set_default("websocket.max_connections", 10000)?
            .set_default("websocket.heartbeat_interval", 30)?
            .set_default("websocket.connection_timeout", 60)?
            .set_default("websocket.message_buffer_size", 100)?
            .set_default("websocket.enable_compression", true)?
            .set_default("cache.quote_ttl", 5)?
            .set_default("cache.ohlcv_ttl", 60)?
            .set_default("cache.orderbook_ttl", 1)?
            .set_default("cache.max_size", 100)?
            .build()?;

        Ok(config.try_deserialize()?)
    }

    /// Get database URL
    pub fn database_url(&self) -> &str {
        &self.database_url
    }

    /// Get Redis URL
    pub fn redis_url(&self) -> &str {
        &self.redis_url
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        std::env::set_var("DATABASE_URL", "postgres://localhost/test");
        let config = Config::from_env().unwrap();
        assert_eq!(config.host, "0.0.0.0");
        assert_eq!(config.port, 8080);
    }
}
