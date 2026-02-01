//! Trading Platform - Shared Types
//! 
//! This crate contains all shared types used across the trading platform services.

#![warn(missing_docs)]

pub mod market_data;
pub mod order;
pub mod indicator;
pub mod chart;
pub mod user;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Unique identifier type alias
pub type Id = Uuid;

/// Timestamp type alias
pub type Timestamp = DateTime<Utc>;

/// Generate a new unique ID
pub fn new_id() -> Id {
    Uuid::new_v4()
}

/// Current timestamp
pub fn now() -> Timestamp {
    Utc::now()
}

/// Common API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse<T> {
    /// Whether the request was successful
    pub success: bool,
    /// Response data (if successful)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    /// Error message (if failed)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    /// Request ID for tracing
    pub request_id: String,
    /// Response timestamp
    pub timestamp: Timestamp,
}

impl<T> ApiResponse<T> {
    /// Create a successful response
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            request_id: new_id().to_string(),
            timestamp: now(),
        }
    }

    /// Create an error response
    pub fn error(message: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message.into()),
            request_id: new_id().to_string(),
            timestamp: now(),
        }
    }
}

/// Pagination parameters
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Pagination {
    /// Page number (0-indexed)
    pub page: u32,
    /// Items per page
    pub limit: u32,
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: 0,
            limit: 20,
        }
    }
}

/// Paginated response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResponse<T> {
    /// Items in current page
    pub items: Vec<T>,
    /// Total number of items
    pub total: u64,
    /// Current page
    pub page: u32,
    /// Items per page
    pub limit: u32,
    /// Total pages
    pub total_pages: u32,
}

impl<T> PaginatedResponse<T> {
    /// Create a new paginated response
    pub fn new(items: Vec<T>, total: u64, page: u32, limit: u32) -> Self {
        let total_pages = ((total as f64) / (limit as f64)).ceil() as u32;
        Self {
            items,
            total,
            page,
            limit,
            total_pages,
        }
    }
}

/// Timeframe for chart data
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Timeframe {
    /// 1 second
    #[serde(rename = "1s")]
    OneSecond,
    /// 5 seconds
    #[serde(rename = "5s")]
    FiveSeconds,
    /// 15 seconds
    #[serde(rename = "15s")]
    FifteenSeconds,
    /// 30 seconds
    #[serde(rename = "30s")]
    ThirtySeconds,
    /// 1 minute
    #[serde(rename = "1m")]
    OneMinute,
    /// 3 minutes
    #[serde(rename = "3m")]
    ThreeMinutes,
    /// 5 minutes
    #[serde(rename = "5m")]
    FiveMinutes,
    /// 15 minutes
    #[serde(rename = "15m")]
    FifteenMinutes,
    /// 30 minutes
    #[serde(rename = "30m")]
    ThirtyMinutes,
    /// 1 hour
    #[serde(rename = "1h")]
    OneHour,
    /// 2 hours
    #[serde(rename = "2h")]
    TwoHours,
    /// 4 hours
    #[serde(rename = "4h")]
    FourHours,
    /// Daily
    #[serde(rename = "1d")]
    OneDay,
    /// Weekly
    #[serde(rename = "1w")]
    OneWeek,
    /// Monthly
    #[serde(rename = "1M")]
    OneMonth,
}

impl Timeframe {
    /// Get the duration in seconds
    pub fn as_seconds(&self) -> i64 {
        match self {
            Timeframe::OneSecond => 1,
            Timeframe::FiveSeconds => 5,
            Timeframe::FifteenSeconds => 15,
            Timeframe::ThirtySeconds => 30,
            Timeframe::OneMinute => 60,
            Timeframe::ThreeMinutes => 180,
            Timeframe::FiveMinutes => 300,
            Timeframe::FifteenMinutes => 900,
            Timeframe::ThirtyMinutes => 1800,
            Timeframe::OneHour => 3600,
            Timeframe::TwoHours => 7200,
            Timeframe::FourHours => 14400,
            Timeframe::OneDay => 86400,
            Timeframe::OneWeek => 604800,
            Timeframe::OneMonth => 2592000,
        }
    }

    /// Get the timeframe as a string
    pub fn as_str(&self) -> &'static str {
        match self {
            Timeframe::OneSecond => "1s",
            Timeframe::FiveSeconds => "5s",
            Timeframe::FifteenSeconds => "15s",
            Timeframe::ThirtySeconds => "30s",
            Timeframe::OneMinute => "1m",
            Timeframe::ThreeMinutes => "3m",
            Timeframe::FiveMinutes => "5m",
            Timeframe::FifteenMinutes => "15m",
            Timeframe::ThirtyMinutes => "30m",
            Timeframe::OneHour => "1h",
            Timeframe::TwoHours => "2h",
            Timeframe::FourHours => "4h",
            Timeframe::OneDay => "1d",
            Timeframe::OneWeek => "1w",
            Timeframe::OneMonth => "1M",
        }
    }
}

impl std::fmt::Display for Timeframe {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl std::str::FromStr for Timeframe {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "1s" => Ok(Timeframe::OneSecond),
            "5s" => Ok(Timeframe::FiveSeconds),
            "15s" => Ok(Timeframe::FifteenSeconds),
            "30s" => Ok(Timeframe::ThirtySeconds),
            "1m" => Ok(Timeframe::OneMinute),
            "3m" => Ok(Timeframe::ThreeMinutes),
            "5m" => Ok(Timeframe::FiveMinutes),
            "15m" => Ok(Timeframe::FifteenMinutes),
            "30m" => Ok(Timeframe::ThirtyMinutes),
            "1h" => Ok(Timeframe::OneHour),
            "2h" => Ok(Timeframe::TwoHours),
            "4h" => Ok(Timeframe::FourHours),
            "1d" => Ok(Timeframe::OneDay),
            "1w" => Ok(Timeframe::OneWeek),
            "1M" => Ok(Timeframe::OneMonth),
            _ => Err(format!("Invalid timeframe: {}", s)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timeframe_as_seconds() {
        assert_eq!(Timeframe::OneMinute.as_seconds(), 60);
        assert_eq!(Timeframe::OneHour.as_seconds(), 3600);
        assert_eq!(Timeframe::OneDay.as_seconds(), 86400);
    }

    #[test]
    fn test_timeframe_from_str() {
        assert_eq!("1m".parse::<Timeframe>().unwrap(), Timeframe::OneMinute);
        assert_eq!("1h".parse::<Timeframe>().unwrap(), Timeframe::OneHour);
        assert!("invalid".parse::<Timeframe>().is_err());
    }

    #[test]
    fn test_api_response_success() {
        let response: ApiResponse<i32> = ApiResponse::success(42);
        assert!(response.success);
        assert_eq!(response.data, Some(42));
        assert!(response.error.is_none());
    }

    #[test]
    fn test_api_response_error() {
        let response: ApiResponse<i32> = ApiResponse::error("Something went wrong");
        assert!(!response.success);
        assert!(response.data.is_none());
        assert_eq!(response.error, Some("Something went wrong".to_string()));
    }
}
