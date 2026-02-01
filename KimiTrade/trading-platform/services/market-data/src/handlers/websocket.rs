//! WebSocket handler

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::State,
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::time::{interval, Duration};
use tracing::{debug, error, info, warn};

use crate::{error::AppError, AppState};

/// WebSocket message types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WsMessage {
    /// Subscribe to a channel
    Subscribe { channel: String, symbol: String },
    /// Unsubscribe from a channel
    Unsubscribe { channel: String, symbol: String },
    /// Price update
    PriceUpdate {
        symbol: String,
        price: f64,
        timestamp: i64,
    },
    /// OHLCV update
    OHLCVUpdate {
        symbol: String,
        timeframe: String,
        open: f64,
        high: f64,
        low: f64,
        close: f64,
        volume: f64,
        timestamp: i64,
    },
    /// Trade update
    TradeUpdate {
        symbol: String,
        price: f64,
        volume: f64,
        side: String,
        timestamp: i64,
    },
    /// Order book update
    OrderBookUpdate {
        symbol: String,
        bids: Vec<(f64, f64)>,
        asks: Vec<(f64, f64)>,
        timestamp: i64,
    },
    /// Heartbeat/ping
    Ping,
    /// Heartbeat/pong response
    Pong,
    /// Error message
    Error { message: String },
}

/// Handle WebSocket connection upgrade
pub async fn handle_ws(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

/// Handle WebSocket connection
async fn handle_socket(socket: WebSocket, state: AppState) {
    info!("New WebSocket connection established");

    let (mut sender, mut receiver) = socket.split();

    // Spawn heartbeat task
    let mut heartbeat_interval = interval(Duration::from_secs(30));

    // Handle incoming messages
    loop {
        tokio::select! {
            // Handle incoming WebSocket messages
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        debug!("Received WebSocket message: {}", text);
                        
                        match serde_json::from_str::<WsMessage>(&text) {
                            Ok(ws_msg) => {
                                if let Err(e) = handle_message(ws_msg, &state).await {
                                    warn!("Error handling message: {}", e);
                                    let error_msg = WsMessage::Error {
                                        message: e.to_string(),
                                    };
                                    if let Ok(json) = serde_json::to_string(&error_msg) {
                                        let _ = sender.send(Message::Text(json)).await;
                                    }
                                }
                            }
                            Err(e) => {
                                warn!("Failed to parse WebSocket message: {}", e);
                                let error_msg = WsMessage::Error {
                                    message: format!("Invalid message format: {}", e),
                                };
                                if let Ok(json) = serde_json::to_string(&error_msg) {
                                    let _ = sender.send(Message::Text(json)).await;
                                }
                            }
                        }
                    }
                    Some(Ok(Message::Close(_))) => {
                        info!("WebSocket connection closed by client");
                        break;
                    }
                    Some(Ok(Message::Ping(data))) => {
                        if let Err(e) = sender.send(Message::Pong(data)).await {
                            error!("Failed to send pong: {}", e);
                            break;
                        }
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error: {}", e);
                        break;
                    }
                    _ => {}
                }
            }
            
            // Send heartbeat
            _ = heartbeat_interval.tick() => {
                let ping = WsMessage::Ping;
                if let Ok(json) = serde_json::to_string(&ping) {
                    if let Err(e) = sender.send(Message::Text(json)).await {
                        error!("Failed to send heartbeat: {}", e);
                        break;
                    }
                }
            }
        }
    }

    info!("WebSocket connection closed");
}

/// Handle a WebSocket message
async fn handle_message(msg: WsMessage, state: &AppState) -> anyhow::Result<()> {
    match msg {
        WsMessage::Subscribe { channel, symbol } => {
            info!("Subscribe request: channel={}, symbol={}", channel, symbol);
            // TODO: Implement subscription logic
            Ok(())
        }
        WsMessage::Unsubscribe { channel, symbol } => {
            info!("Unsubscribe request: channel={}, symbol={}", channel, symbol);
            // TODO: Implement unsubscription logic
            Ok(())
        }
        WsMessage::Ping => {
            // Ping received, will be handled by heartbeat
            Ok(())
        }
        _ => {
            warn!("Unexpected message type received");
            Ok(())
        }
    }
}
