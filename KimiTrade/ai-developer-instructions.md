# AI GELİŞTİRİCİ TALİMATLARI
## Trading Platformu için Detaylı Kodlama Kılavuzu

---

## 1. GENEL PRENSİPLER

### 1.1 Kod Kalitesi Standartları
- **KISS (Keep It Simple, Stupid)**: Karmaşık çözümlerden kaçının
- **DRY (Don't Repeat Yourself)**: Kod tekrarından kaçının
- **YAGNI (You Aren't Gonna Need It)**: Gereksiz özellikler eklemeyin
- **SOLID Prensipleri**: Her zaman uygulayın

### 1.2 Performans Öncelikleri
- Latency kritik path'lerde allocation'dan kaçının
- Lock-free data structures kullanın
- SIMD optimizasyonları düşünün
- Cache locality'ye dikkat edin

---

## 2. DİL SPESİFİK TALİMATLAR

### 2.1 RUST

#### Memory Management
```rust
// ✅ DO: Stack allocation tercih edin
#[inline(always)]
fn fast_calculation(prices: &[f64]) -> f64 {
    let mut sum = 0.0;
    for price in prices {
        sum += price;
    }
    sum / prices.len() as f64
}

// ❌ DON'T: Gereksiz heap allocation
fn slow_calculation(prices: Vec<f64>) -> f64 {
    prices.iter().sum::<f64>() / prices.len() as f64
}
```

#### Async/Await
```rust
// ✅ DO: Proper error handling with context
use anyhow::{Context, Result};

async fn fetch_market_data(symbol: &str) -> Result<MarketData> {
    let client = reqwest::Client::new();
    let response = client
        .get(format!("https://api.exchange.com/{}", symbol))
        .timeout(Duration::from_secs(5))
        .send()
        .await
        .with_context(|| format!("Failed to fetch data for {}", symbol))?;
    
    response
        .json::<MarketData>()
        .await
        .context("Failed to parse market data")
}

// ❌ DON'T: Bare .await without error context
async fn bad_fetch(symbol: &str) -> MarketData {
    reqwest::get(format!("https://api.exchange.com/{}", symbol))
        .await
        .unwrap()
        .json()
        .await
        .unwrap()
}
```

#### Concurrency
```rust
// ✅ DO: Use channels for communication
use tokio::sync::mpsc;

pub struct PriceFeed {
    sender: mpsc::Sender<PriceUpdate>,
    receiver: mpsc::Receiver<PriceUpdate>,
}

impl PriceFeed {
    pub async fn start(&mut self) {
        while let Some(update) = self.receiver.recv().await {
            self.process_update(update).await;
        }
    }
}

// ❌ DON'T: Share mutable state directly
use std::sync::Mutex;

lazy_static! {
    static ref PRICES: Mutex<HashMap<String, f64>> = Mutex::new(HashMap::new());
}
```

#### Unsafe Code
```rust
// ✅ DO: Document and minimize unsafe blocks
/// # Safety
/// Pointer must be valid and properly aligned
unsafe fn process_raw_buffer(ptr: *const u8, len: usize) {
    debug_assert!(!ptr.is_null());
    debug_assert!(len > 0);
    
    let slice = std::slice::from_raw_parts(ptr, len);
    // ... processing
}

// ❌ DON'T: Unnecessary unsafe
unsafe { some_safe_function() }
```

### 2.2 GO

#### Error Handling
```go
// ✅ DO: Wrap errors with context
type MarketDataError struct {
    Op   string
    Sym  string
    Err  error
}

func (e *MarketDataError) Error() string {
    return fmt.Sprintf("market data %s for %s: %v", e.Op, e.Sym, e.Err)
}

func (e *MarketDataError) Unwrap() error {
    return e.Err
}

func FetchPrice(ctx context.Context, symbol string) (*Price, error) {
    price, err := cache.Get(ctx, symbol)
    if err != nil {
        return nil, &MarketDataError{Op: "cache get", Sym: symbol, Err: err}
    }
    return price, nil
}

// ❌ DON'T: Silent error handling
func BadFetch(symbol string) *Price {
    price, _ := cache.Get(symbol)  // Error ignored!
    return price
}
```

#### Context Usage
```go
// ✅ DO: Pass context through call chain
func (s *Service) ProcessOrder(ctx context.Context, order *Order) error {
    ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()
    
    if err := s.validateOrder(ctx, order); err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }
    
    return s.executeOrder(ctx, order)
}

// ❌ DON'T: Use context.Background() deep in call stack
func badFunction() {
    ctx := context.Background()  // Wrong!
    db.Query(ctx, "SELECT * FROM orders")
}
```

#### Struct Design
```go
// ✅ DO: Clear struct with constructor
type OrderBook struct {
    symbol    string
    bids      *RBTree
    asks      *RBTree
    mu        sync.RWMutex
    updatedAt time.Time
}

func NewOrderBook(symbol string) *OrderBook {
    return &OrderBook{
        symbol: symbol,
        bids:   NewRBTree(),
        asks:   NewRBTree(),
    }
}

// ❌ DON'T: Zero-value initialization
var book OrderBook  // Incomplete initialization
```

### 2.3 TYPESCRIPT/REACT

#### Component Design
```typescript
// ✅ DO: Clear props interface with defaults
interface ChartContainerProps {
  symbol: string;
  timeframe: Timeframe;
  chartType?: ChartType;  // Optional with default
  indicators?: IndicatorConfig[];
  onPriceUpdate?: (price: number) => void;
  className?: string;
}

const DEFAULT_CHART_TYPE: ChartType = 'candlestick';

export const ChartContainer: React.FC<ChartContainerProps> = ({
  symbol,
  timeframe,
  chartType = DEFAULT_CHART_TYPE,
  indicators = [],
  onPriceUpdate,
  className,
}) => {
  // Implementation
};

// ❌ DON'T: Any types and unclear props
function BadChart(props: any) {
  return <div>{props.data}</div>;
}
```

#### Hooks Usage
```typescript
// ✅ DO: Custom hooks for reusable logic
export function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = marketDataService.subscribe(symbol, {
      onData: setData,
      onError: setError,
    });
    
    setIsLoading(false);
    
    return () => unsubscribe();
  }, [symbol]);
  
  return { data, error, isLoading };
}

// Usage
function TradingPanel({ symbol }: { symbol: string }) {
  const { data, error, isLoading } = useMarketData(symbol);
  
  if (isLoading) return <Loading />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <PriceDisplay price={data?.price} />;
}

// ❌ DON'T: Duplicate logic in components
function BadComponent1() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
}

function BadComponent2() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);  // Duplicate!
  }, []);
}
```

#### Performance Optimization
```typescript
// ✅ DO: Memoization for expensive calculations
const MemoizedIndicator = React.memo<IndicatorProps>(
  ({ data, config }) => {
    const values = useMemo(
      () => calculateIndicator(data, config),
      [data, config]
    );
    
    return <IndicatorPlot values={values} />;
  },
  (prev, next) => 
    prev.data === next.data && 
    prev.config.period === next.config.period
);

// ✅ DO: Virtualization for long lists
import { FixedSizeList } from 'react-window';

function SymbolList({ symbols }: { symbols: Symbol[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={symbols.length}
      itemSize={40}
      width="100%"
    >
      {({ index, style }) => (
        <SymbolRow 
          symbol={symbols[index]} 
          style={style} 
        />
      )}
    </FixedSizeList>
  );
}
```

---

## 3. FINANSAL HESAPLAMA STANDARTLARI

### 3.1 Floating Point Hassasiyeti
```rust
// ✅ DO: Use Decimal for financial calculations
use rust_decimal::Decimal;
use rust_decimal_macros::dec;

fn calculate_pnl(entry: Decimal, exit: Decimal, qty: Decimal) -> Decimal {
    (exit - entry) * qty
}

// ❌ DON'T: Use f64 for money
fn bad_pnl(entry: f64, exit: f64, qty: f64) -> f64 {
    (exit - entry) * qty  // Precision errors!
}
```

### 3.2 Gösterge Hesaplamaları
```rust
// ✅ DO: Efficient indicator implementation
pub struct RSI {
    period: usize,
    gains: CircularBuffer<f64>,
    losses: CircularBuffer<f64>,
    prev_price: Option<f64>,
    avg_gain: f64,
    avg_loss: f64,
}

impl RSI {
    pub fn new(period: usize) -> Self {
        Self {
            period,
            gains: CircularBuffer::new(period),
            losses: CircularBuffer::new(period),
            prev_price: None,
            avg_gain: 0.0,
            avg_loss: 0.0,
        }
    }
    
    pub fn next(&mut self, price: f64) -> f64 {
        if let Some(prev) = self.prev_price {
            let change = price - prev;
            let gain = change.max(0.0);
            let loss = (-change).max(0.0);
            
            // Wilder's smoothing
            self.avg_gain = (self.avg_gain * (self.period - 1) as f64 + gain) 
                / self.period as f64;
            self.avg_loss = (self.avg_loss * (self.period - 1) as f64 + loss) 
                / self.period as f64;
        }
        
        self.prev_price = Some(price);
        
        if self.avg_loss == 0.0 {
            100.0
        } else {
            let rs = self.avg_gain / self.avg_loss;
            100.0 - (100.0 / (1.0 + rs))
        }
    }
}
```

---

## 4. WEBGL ve GRAFİK OPTİMİZASYONU

### 4.1 Buffer Management
```typescript
// ✅ DO: Efficient buffer updates
class ChartRenderer {
  private positionBuffer: WebGLBuffer;
  private dataTexture: WebGLTexture;
  
  updateData(prices: Float32Array) {
    const gl = this.gl;
    
    // Use texture for large datasets
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      prices.length,
      1,
      0,
      gl.RED,
      gl.FLOAT,
      prices
    );
  }
  
  render() {
    // Instanced rendering for multiple series
    gl.drawArraysInstanced(
      gl.LINE_STRIP,
      0,
      this.vertexCount,
      this.seriesCount
    );
  }
}
```

### 4.2 Shader Optimization
```glsl
// ✅ DO: Efficient vertex shader
#version 300 es

uniform mat4 u_transform;
uniform sampler2D u_dataTexture;
uniform float u_pointCount;

in float a_instanceId;

out float v_value;

void main() {
  // Sample from texture instead of attribute
  float x = float(gl_VertexID) / u_pointCount;
  float y = texelFetch(u_dataTexture, ivec2(gl_VertexID, 0), 0).r;
  
  vec4 position = vec4(x, y, 0.0, 1.0);
  gl_Position = u_transform * position;
  
  v_value = y;
}
```

---

## 5. TEST YAZMA KILAVUZU

### 5.1 Unit Test Patterns
```rust
#[cfg(test)]
mod indicator_tests {
    use super::*;
    
    // Test fixtures
    fn sample_ohlcv() -> Vec<OHLCV> {
        vec![
            OHLCV { open: 100.0, high: 105.0, low: 98.0, close: 102.0, volume: 1000.0, timestamp: 0 },
            OHLCV { open: 102.0, high: 108.0, low: 101.0, close: 107.0, volume: 1500.0, timestamp: 60 },
            // ... more data
        ]
    }
    
    #[test]
    fn sma_calculates_correctly() {
        let prices = vec![10.0, 11.0, 12.0, 13.0, 14.0];
        let sma = SMA::new(3);
        
        let result: Vec<f64> = prices.iter()
            .map(|&p| sma.next(p))
            .collect();
        
        assert!(result[0].is_nan());  // Not enough data
        assert!(result[1].is_nan());  // Not enough data
        assert_eq!(result[2], 11.0);  // (10+11+12)/3
        assert_eq!(result[3], 12.0);  // (11+12+13)/3
        assert_eq!(result[4], 13.0);  // (12+13+14)/3
    }
    
    #[test]
    fn sma_handles_edge_cases() {
        let sma = SMA::new(0);
        // Should panic or return error for invalid period
    }
    
    #[test]
    fn sma_property_based() {
        // Property-based testing with proptest
        proptest!(|(prices in vec(1.0f64..1000.0, 10..1000))| {
            let sma = SMA::new(14);
            let results: Vec<f64> = prices.iter()
                .map(|&p| sma.next(p))
                .collect();
            
            // Property: SMA should be within min/max of input
            for (i, &result) in results.iter().enumerate().skip(14) {
                let window = &prices[i-13..=i];
                let min = window.iter().fold(f64::INFINITY, |a, &b| a.min(b));
                let max = window.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
                
                prop_assert!(result >= min && result <= max);
            }
        });
    }
}
```

### 5.2 Integration Test Patterns
```typescript
// ✅ DO: Component integration tests
describe('Chart with Indicators', () => {
  it('should sync indicator with price updates', async () => {
    const { container } = render(
      <TradingChart
        symbol="AAPL"
        timeframe="1D"
        indicators={[{ type: 'SMA', period: 20 }]}
      />
    );
    
    // Wait for initial load
    await waitFor(() => 
      expect(screen.getByTestId('chart-loaded')).toBeInTheDocument()
    );
    
    // Simulate price update
    const newPrice = { price: 150.0, timestamp: Date.now() };
    mockWebSocket.emit('price.update', newPrice);
    
    // Verify indicator recalculation
    await waitFor(() => {
      const smaLine = container.querySelector('.sma-line');
      expect(smaLine).toHaveAttribute('data-value');
    });
  });
});
```

---

## 6. HATA AYIKLAMA ve PROFILING

### 6.1 Rust Debugging
```rust
// ✅ DO: Structured logging
use tracing::{info, debug, error, span, Level};

#[tracing::instrument(skip(self), fields(symbol = %self.symbol))]
pub async fn process_order(&self, order: Order) -> Result<OrderId> {
    debug!(?order, "Processing new order");
    
    let span = span!(Level::INFO, "validation");
    let _enter = span.enter();
    
    self.validate_order(&order)?;
    
    drop(_enter);
    
    let order_id = self.execute(order).await?;
    
    info!(%order_id, "Order processed successfully");
    
    Ok(order_id)
}
```

### 6.2 Performance Profiling
```rust
// ✅ DO: Instrument critical sections
use std::time::Instant;

pub fn calculate_indicator(&self, data: &[f64]) -> Vec<f64> {
    let start = Instant::now();
    
    let result = self.expensive_calculation(data);
    
    metrics::histogram!("indicator.calculation.duration", 
        start.elapsed().as_micros() as f64);
    
    result
}
```

---

## 7. GÜVENLİK EN İYİ UYGULAMALARI

### 7.1 Input Validation
```rust
// ✅ DO: Strict input validation
use validator::Validate;

#[derive(Debug, Validate)]
pub struct OrderRequest {
    #[validate(length(min = 1, max = 20))]
    pub symbol: String,
    
    #[validate(range(min = 0.01))]
    pub quantity: f64,
    
    #[validate(custom = "validate_price")]
    pub price: Option<f64>,
    
    #[validate(custom = "validate_order_type")]
    pub order_type: OrderType,
}

fn validate_price(price: &f64) -> Result<(), ValidationError> {
    if !price.is_finite() || *price <= 0.0 {
        return Err(ValidationError::new("invalid_price"));
    }
    Ok(())
}
```

### 7.2 Secrets Management
```rust
// ✅ DO: Use environment variables with defaults
use secrecy::{ExposeSecret, Secret};

pub struct Config {
    pub database_url: Secret<String>,
    pub api_key: Secret<String>,
    pub jwt_secret: Secret<String>,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            database_url: Secret::new(
                env::var("DATABASE_URL")
                    .context("DATABASE_URL must be set")?
            ),
            api_key: Secret::new(
                env::var("API_KEY")
                    .context("API_KEY must be set")?
            ),
            jwt_secret: Secret::new(
                env::var("JWT_SECRET")
                    .context("JWT_SECRET must be set")?
            ),
        })
    }
}

// Never log secrets!
// ❌ DON'T: println!("API Key: {}", config.api_key.expose_secret());
```

---

## 8. DOKÜMANTASYON STANDARTLARI

### 8.1 API Documentation
```rust
/// Calculates the Relative Strength Index (RSI) for a price series
///
/// # Arguments
///
/// * `prices` - A slice of closing prices in chronological order
/// * `period` - The RSI calculation period (typically 14)
///
/// # Returns
///
/// Returns a `Vec<f64>` containing RSI values. The first `period` values
/// will be `NaN` as there's insufficient data.
///
/// # Examples
///
/// ```
/// use trading_platform::indicators::rsi;
///
/// let prices = vec![
///     44.34, 44.09, 44.15, 43.61, 44.33,
///     44.83, 45.10, 45.42, 45.84, 46.08,
///     45.89, 46.03, 45.61, 46.28, 46.28,
/// ];
///
/// let rsi_values = rsi(&prices, 14);
/// assert!(!rsi_values[13].is_nan());  // First valid RSI
/// ```
///
/// # Errors
///
/// Returns an empty vector if `prices` is empty or `period` is 0.
///
/// # References
///
/// - [Wikipedia - Relative Strength Index](https://en.wikipedia.org/wiki/Relative_strength_index)
/// - Wilder, J. Welles (1978). *New Concepts in Technical Trading Systems*
pub fn rsi(prices: &[f64], period: usize) -> Vec<f64> {
    // Implementation
}
```

### 8.2 Architecture Decision Records (ADR)
```markdown
# ADR-001: WebGL for Chart Rendering

## Status
Accepted

## Context
We need to render financial charts with:
- 1M+ data points
- 60fps interaction
- Multiple synchronized charts

## Decision
Use WebGL 2.0 with custom shaders instead of Canvas 2D or SVG.

## Consequences

### Positive
- 10x better performance for large datasets
- GPU-accelerated rendering
- Better battery life on mobile

### Negative
- Steeper learning curve
- More complex debugging
- Browser compatibility concerns

## Alternatives Considered
- Canvas 2D: Too slow for >100k points
- SVG: DOM overhead unacceptable
- Third-party libraries: Lack customization needed
```

---

## 9. KOD İNCELEME (CODE REVIEW) CHECKLIST

### 9.1 Genel Kontroller
- [ ] Kod derleniyor ve testler geçiyor
- [ ] Yeni kod için testler yazılmış
- [ ] Dokümantasyon güncellenmiş
- [ ] CHANGELOG.md güncellenmiş
- [ ] Breaking changes belgelenmiş

### 9.2 Performans Kontrolleri
- [ ] Gereksiz allocation yok
- [ ] Algorithmic complexity uygun
- [ ] Database queries optimize edilmiş
- [ ] N+1 query problemi yok

### 9.3 Güvenlik Kontrolleri
- [ ] Input validation var
- [ ] SQL injection koruması var
- [ ] XSS koruması var
- [ ] Secrets hardcoded değil
- [ ] Authorization kontrolleri var

### 9.4 Maintainability Kontrolleri
- [ ] Kod anlaşılır ve okunabilir
- [ ] Fonksiyonlar tek sorumluluklu
- [ ] Magic numbers constant olarak tanımlanmış
- [ ] Error handling tutarlı

---

## 10. SIK KARŞILAŞILAN HATALAR ve ÇÖZÜMLERİ

### 10.1 Rust
| Hata | Neden | Çözüm |
|------|-------|-------|
| Borrow checker error | Ownership violation | Use `Arc<Mutex<T>>` or restructure |
| Deadlock | Lock ordering | Always acquire locks in same order |
| Stack overflow | Deep recursion | Use iterative approach or `Box::pin` |
| Async cancellation | Future dropped | Use `tokio::select!` with cleanup |

### 10.2 Go
| Hata | Neden | Çözüm |
|------|-------|-------|
| Goroutine leak | Missing channel close | Use `context.WithCancel` |
| Data race | Unsynchronized access | Use `sync.Mutex` or channels |
| Memory leak | Circular reference | Use `runtime.SetFinalizer` or weak refs |
| Blocking call | Missing timeout | Always use `context.WithTimeout` |

### 10.3 TypeScript
| Hata | Neden | Çözüm |
|------|-------|-------|
| Memory leak | Unsubscribed listeners | Use `useEffect` cleanup |
| Infinite re-render | Mutable dependency | Use `useMemo`/`useCallback` |
| Stale closure | Old state reference | Use functional updates |
| Type error | `any` usage | Enable strict mode |

---

*Bu talimatlar Trading Platformu projesi için AI geliştiricilerin takip etmesi gereken standartları ve en iyi uygulamaları içerir.*

Versiyon: 1.0
Son Güncelleme: 2026-02-01
