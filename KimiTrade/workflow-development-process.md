# WORKFLOW ve GELİŞTİRME SÜRECİ
## Trading Platformu - Detaylı İş Akışı Rehberi

---

## 1. PROJE YÖNETİMİ

### 1.1 Agile Metodoloji
- **Sprint Süresi**: 2 hafta
- **Daily Standup**: Her gün 09:00'da (15 dakika)
- **Sprint Planning**: Pazartesi sabahları
- **Sprint Review**: Cuma öğleden sonra
- **Retrospective**: Her sprint sonu

### 1.2 Story Point Sistemi
| Puan | Zaman | Karmaşıklık |
|------|-------|-------------|
| 1 | 1-2 saat | Trivial |
| 2 | 2-4 saat | Basit |
| 3 | 4-8 saat | Orta |
| 5 | 1-2 gün | Karmaşık |
| 8 | 2-3 gün | Çok karmaşık |
| 13 | 3-5 gün | Epic seviyesi |

---

## 2. GELİŞTİRME FAZLARI

### FAZ 1: ALTYAPI ve TEMEL MİMARİ (Hafta 1-4)

#### Hafta 1-2: Proje Kurulumu
```
Görevler:
├── Monorepo yapılandırması (Nx/Turborepo)
├── CI/CD pipeline (GitHub Actions)
├── Docker containerization
├── Kubernetes manifestleri
├── Development ortamı setup
└── README ve CONTRIBUTING.md

Çıktılar:
├── Çalışan development ortamı
├── Otomatik test ve deploy pipeline
├── Temel proje yapısı
└── Dokümantasyon
```

#### Hafta 3-4: Temel Servisler
```
Görevler:
├── API Gateway (Kong/Nginx)
├── Service mesh (Istio) kurulumu
├── Authentication service
├── Authorization (RBAC)
├── Centralized logging (ELK)
├── Monitoring (Prometheus/Grafana)
└── Distributed tracing (Jaeger)

Çıktılar:
├── Çalışan API Gateway
├── Observability stack
├── Auth/Authz sistemi
└── Service-to-service communication
```

### FAZ 2: GRAFİK ve VERİ (Hafta 5-10)

#### Hafta 5-6: WebGL Grafik Motoru
```
Görevler:
├── WebGL 2.0 context setup
├── Shader programları (vertex/fragment)
├── Buffer management sistemi
├── Texture-based data rendering
├── Viewport ve transformasyon
├── Zoom/pan interaction
└── Crosshair ve cursor

Teknik Detaylar:
- VAO/VBO kullanımı
- Instanced rendering
- Framebuffer objects
- Texture atlasing
- Level-of-detail (LOD) sistemi

Performans Hedefleri:
- 1M+ veri noktası @ 60fps
- < 16ms render süresi
- < 50MB GPU memory
```

#### Hafta 7-8: Market Data Servisi
```
Görevler:
├── WebSocket server (Rust/Tokio)
├── Exchange feed entegrasyonları
├── Data normalization
├── Kafka topic yapılandırması
├── Redis cache layer
├── Historical data API
└── Real-time subscription management

Veri Akışı:
Exchange Feed → Feed Handler → Kafka → 
Consumer → Redis Cache → WebSocket → Client

Entegrasyonlar:
├── Polygon.io
├── Alpaca Markets
├── Binance
├── Coinbase Pro
├── Forex feeds (various)
└── Custom data providers
```

#### Hafta 9-10: Frontend Integration
```
Görevler:
├── React + TypeScript setup
├── State management (Zustand)
├── WebSocket client
├── Chart component
├── Symbol search
├── Timeframe selector
├── Chart type selector
└── Drawing tools UI

Component Hierarchy:
App
├── Layout
│   ├── Header
│   │   ├── SymbolSearch
│   │   ├── TimeframeSelector
│   │   └── ChartTypeSelector
│   ├── ChartContainer
│   │   ├── Chart (WebGL)
│   │   ├── Crosshair
│   │   ├── PriceScale
│   │   └── TimeScale
│   └── Sidebar
│       ├── Watchlist
│       └── Indicators
```

### FAZ 3: GÖSTERGELER ve SCRIPT (Hafta 11-16)

#### Hafta 11-12: Indicator Engine
```
Görevler:
├── Indicator trait tanımı
├── WASM compilation pipeline
├── Runtime execution environment
├── 50+ temel gösterge
├── Gösterge kütüphanesi UI
├── Gösterge parametre editor
└── Multi-timeframe göstergeler

Gösterge Kategorileri:
├── Trend (SMA, EMA, MACD, Bollinger Bands)
├── Momentum (RSI, Stochastic, CCI)
├── Volume (OBV, Volume Profile, MFI)
├── Volatility (ATR, Keltner, Donchian)
└── Custom (User-defined)

WASM Interface:
#[wasm_bindgen]
pub struct IndicatorInstance {
    indicator: Box<dyn Indicator>,
    state: IndicatorState,
}

#[wasm_bindgen]
impl IndicatorInstance {
    pub fn new(name: &str, params: JsValue) -> Self;
    pub fn next(&mut self, data: &[f64]) -> JsValue;
    pub fn reset(&mut self);
}
```

#### Hafta 13-14: Scripting Engine
```
Görevler:
├── Lexer implementasyonu
├── Parser (AST generation)
├── Type checker
├── Compiler (bytecode)
├── VM (interpreter/JIT)
├── Standard library
├── Debug ve profiling tools
└── Documentation

Script Language Features:
├── Variables (series/scalar)
├── Operators (arithmetic/logical)
├── Control flow (if/else, for, while)
├── Functions (built-in/user-defined)
├── Indicators (calling from script)
├── Plotting (draw on chart)
├── Alerts (conditions)
└── Strategies (backtesting)

Example Script:
//@version=1
indicator("My RSI Strategy", overlay=false)

rsiPeriod = input.int(14, "RSI Period")
overbought = input.int(70, "Overbought")
oversold = input.int(30, "Oversold")

rsiValue = rsi(close, rsiPeriod)

plot(rsiValue, "RSI", color.blue)
hline(overbought, "Overbought", color.red)
hline(oversold, "Oversold", color.green)

longCondition = crossover(rsiValue, oversold)
shortCondition = crossunder(rsiValue, overbought)

if longCondition
    strategy.entry("Long", strategy.long)
    
if shortCondition
    strategy.close("Long")
```

#### Hafta 15-16: Backtest Engine
```
Görevler:
├── Historical data loading
├── Strategy execution engine
├── Performance metrics calculation
├── Trade simulation
├── Slippage ve commission model
├── Visual backtest results
├── Optimization (parameter sweep)
└── Walk-forward analysis

Backtest Metrics:
├── Net Profit
├── Gross Profit/Loss
├── Profit Factor
├── Sharpe Ratio
├── Sortino Ratio
├── Maximum Drawdown
├── Win Rate
├── Average Trade
└── Expectancy
```

### FAZ 4: İŞLEM ve RİSK (Hafta 17-22)

#### Hafta 17-18: Order Management
```
Görevler:
├── Order types (market, limit, stop, etc.)
├── Order lifecycle management
├── Position tracking
├── P&L calculation
├── Risk checks (pre-trade)
├── Order routing
├── Execution reports
└── Reconciliation

Order Types:
├── Market Order
├── Limit Order
├── Stop Order
├── Stop-Limit Order
├── Trailing Stop
├── Bracket Order
├── OCO (One-Cancels-Other)
└── Iceberg Order
```

#### Hafta 19-20: Broker Entegrasyonları
```
Görevler:
├── Broker API abstraction layer
├── Alpaca integration
├── Interactive Brokers
├── TD Ameritrade
├── Binance
├── Coinbase
├── Webull
└── Paper trading simulation

Broker Interface:
trait Broker {
    async fn connect(&mut self) -> Result<()>;
    async fn disconnect(&mut self) -> Result<()>;
    async fn place_order(&self, order: Order) -> Result<OrderId>;
    async fn cancel_order(&self, order_id: OrderId) -> Result<()>;
    async fn get_positions(&self) -> Result<Vec<Position>>;
    async fn get_account(&self) -> Result<Account>;
    async fn subscribe_quotes(&self, symbols: &[String]) -> Result<Stream<Quote>>;
}
```

#### Hafta 21-22: Risk Management
```
Görevler:
├── Position sizing rules
├── Stop-loss management
├── Portfolio heat calculation
├── Correlation analysis
├── Value at Risk (VaR)
├── Stress testing
├── Risk reporting
└── Alert system

Risk Rules:
├── Max position size per trade
├── Max portfolio heat
├── Max daily loss
├── Max drawdown
├── Correlation limits
├── Volatility adjustment
└── Sector concentration limits
```

### FAZ 5: SOSYAL ve İLERİ ÖZELLİKLER (Hafta 23-28)

#### Hafta 23-24: Kullanıcı Sistemi
```
Görevler:
├── User registration/login
├── Profile management
├── Subscription plans
├── Billing integration
├── API key management
├── Two-factor authentication
└── Account security

Subscription Tiers:
├── Free (Basic charts, 3 indicators)
├── Essential ($14.95/month)
├── Plus ($29.95/month)
├── Premium ($59.95/month)
├── Expert ($119.95/month)
└── Ultimate ($239.95/month)
```

#### Hafta 25-26: Sosyal Özellikler
```
Görevler:
├── User profiles
├── Following/followers
├── Idea sharing
├── Chart snapshots
├── Comments and likes
├── Notifications
├── Activity feed
└── Moderation tools
```

#### Hafta 27-28: Screener ve Alerts
```
Görevler:
├── Screener engine
├── Filter system
├── Preset screeners
├── Custom filters (Pine Script)
├── Alert system
├── Multi-condition alerts
├── Alert delivery (email, SMS, push)
└── Alert history

Screener Filters:
├── Price (current, change, % change)
├── Volume (current, average, relative)
├── Technical (indicators, patterns)
├── Fundamental (P/E, EPS, etc.)
├── Performance (1D, 1W, 1M, etc.)
└── Custom (script-based)
```

### FAZ 6: OPTİMİZASYON ve PRODÜKSİYON (Hafta 29-32)

#### Hafta 29-30: Performans Optimizasyonu
```
Görevler:
├── Profiling ve bottleneck analizi
├── Database query optimization
├── Cache stratejisi iyileştirmesi
├── CDN yapılandırması
├── Bundle size optimization
├── Lazy loading
├── Code splitting
└── Memory leak detection

Optimization Targets:
├── First Contentful Paint < 1s
├── Time to Interactive < 3s
├── API p99 latency < 100ms
├── WebSocket latency < 10ms
├── Bundle size < 500KB (gzipped)
└── Memory usage < 200MB
```

#### Hafta 31-32: Production Deployment
```
Görevler:
├── Production environment setup
├── Load testing
├── Security audit
├── Disaster recovery plan
├── Monitoring ve alerting
├── Documentation finalization
├── Team training
└── Go-live

Production Checklist:
├── SSL/TLS certificates
├── DDoS protection
├── Backup strategy
├── Log retention
├── Compliance verification
├── Performance benchmarks
├── Security penetration test
└── Runbook creation
```

---

## 3. GİT WORKFLOW

### 3.1 Branch Stratejisi
```
main (production)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/TP-123-chart-zoom
  │     ├── feature/TP-124-indicator-sma
  │     ├── feature/TP-125-order-types
  │     └── ...
  │
  ├── release/v1.0.0
  │     │
  │     └── bugfix/TP-200-critical-fix
  │
  └── hotfix/TP-999-security-patch
```

### 3.2 Commit Mesaj Formatı
```
<type>(<scope>): <subject>

<body>

<footer>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- perf: Performance improvement
- test: Tests
- chore: Build/tools

Example:
feat(charting): add pinch-to-zoom gesture support

- Implement touch event handlers
- Add velocity-based zoom animation
- Update viewport bounds calculation

Closes TP-123
```

### 3.3 Pull Request Süreci
```
1. Feature branch oluştur
   git checkout -b feature/TP-xxx-description

2. Değişiklikleri yap ve commit
   git add .
   git commit -m "feat(scope): description"

3. Branch'i push et
   git push origin feature/TP-xxx-description

4. Pull Request aç
   - Template'i doldur
   - Reviewer ata
   - Labels ekle

5. Code Review
   - En az 2 approval
   - CI checks geçmeli
   - Conflict çözülmeli

6. Merge
   - Squash merge tercih edilir
   - Commit message düzenlenir
```

---

## 4. CI/CD PIPELINE

### 4.1 GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  CARGO_TERM_COLOR: always
  NODE_VERSION: '20'
  RUST_VERSION: '1.75'

jobs:
  # === LINT AND FORMAT ===
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Rust
        uses: dtolnay/rust-action@stable
        with:
          toolchain: ${{ env.RUST_VERSION }}
          components: rustfmt, clippy
      
      - name: Rustfmt
        run: cargo fmt --all -- --check
      
      - name: Clippy
        run: cargo clippy --all-targets --all-features -- -D warnings
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: ESLint
        run: |
          npm ci
          npm run lint
      
      - name: Prettier
        run: npm run format:check

  # === UNIT TESTS ===
  unit-test:
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        service: [charting-engine, market-data, indicator-engine]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Rust
        uses: dtolnay/rust-action@stable
      
      - name: Run tests
        run: cargo test -p ${{ matrix.service }}
      
      - name: Coverage
        run: |
          cargo install cargo-tarpaulin
          cargo tarpaulin -p ${{ matrix.service }} --out Xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./cobertura.xml

  # === INTEGRATION TESTS ===
  integration-test:
    runs-on: ubuntu-latest
    needs: unit-test
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      kafka:
        image: confluentinc/cp-kafka:latest
        ports:
          - 9092:9092
    steps:
      - uses: actions/checkout@v4
      
      - name: Run integration tests
        run: cargo test --test integration

  # === BUILD ===
  build:
    runs-on: ubuntu-latest
    needs: [unit-test, integration-test]
    steps:
      - uses: actions/checkout@v4
      
      - name: Build services
        run: |
          cargo build --release
          npm run build
      
      - name: Build Docker images
        run: |
          docker build -t charting-engine:${{ github.sha }} ./services/charting-engine
          docker build -t market-data:${{ github.sha }} ./services/market-data
          docker build -t web:${{ github.sha }} ./apps/web
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push charting-engine:${{ github.sha }}

  # === DEPLOY TO STAGING ===
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to staging
        run: |
          kubectl config use-context staging
          kubectl set image deployment/charting-engine charting-engine=charting-engine:${{ github.sha }}
          kubectl rollout status deployment/charting-engine

  # === DEPLOY TO PRODUCTION ===
  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: |
          kubectl config use-context production
          kubectl set image deployment/charting-engine charting-engine=charting-engine:${{ github.sha }}
          kubectl rollout status deployment/charting-engine
      
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
```

---

## 5. KOD İNCELEME (CODE REVIEW)

### 5.1 Review Checklist

#### Genel
- [ ] Kod derleniyor ve testler geçiyor
- [ ] Commit mesajları anlamlı ve tutarlı
- [ ] Branch güncel (rebase yapılmış)
- [ ] Conflict yok

#### Kalite
- [ ] Kod okunabilir ve anlaşılır
- [ ] Fonksiyonlar tek sorumluluklu
- [ ] Değişken/fonksiyon isimleri açıklayıcı
- [ ] Yorumlar gerekli yerlerde
- [ ] Magic numbers constant olarak tanımlanmış

#### Test
- [ ] Unit testler yazılmış
- [ ] Edge cases test edilmiş
- [ ] Integration testler var (gerekliyse)
- [ ] Test coverage yeterli (>80%)

#### Güvenlik
- [ ] Input validation var
- [ ] SQL injection koruması var
- [ ] XSS koruması var
- [ ] Secrets hardcoded değil
- [ ] Authorization kontrolleri var

#### Performans
- [ ] Gereksiz allocation yok
- [ ] Database queries optimize edilmiş
- [ ] N+1 query problemi yok
- [ ] Cache kullanımı uygun

### 5.2 Review Süreci
```
1. PR açıldığında otomatik olarak reviewer'lar atanır
2. Her PR en az 2 approval almalı
3. Review yorumlarına 24 saat içinde yanıt verilmeli
4. "Request changes" varsa düzeltilmeli
5. Tüm CI checks geçmeli
6. Conflict varsa çözülmeli
7. Son olarak squash merge yapılır
```

---

## 6. DOKÜMANTASYON

### 6.1 README.md Şablonu
```markdown
# [Servis Adı]

## Açıklama
[Kısa açıklama]

## Kurulum
```bash
# Dependencies
cargo build

# Run
cargo run
```

## API
### [Endpoint]
- **Method**: GET/POST/PUT/DELETE
- **Path**: `/api/v1/...`
- **Request**: [şema]
- **Response**: [şema]

## Test
```bash
cargo test
```

## Deployment
[Deployment talimatları]
```

### 6.2 API Documentation
```yaml
# OpenAPI/Swagger
openapi: 3.0.0
info:
  title: Trading Platform API
  version: 1.0.0
paths:
  /api/v1/symbols/{symbol}/ohlcv:
    get:
      summary: Get OHLCV data
      parameters:
        - name: symbol
          in: path
          required: true
          schema:
            type: string
        - name: timeframe
          in: query
          schema:
            type: string
            default: 1D
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OHLCVResponse'
```

---

## 7. HATA YÖNETİMİ

### 7.1 Bug Report Template
```markdown
## Bug Açıklaması
[Kısa açıklama]

## Reproducition Steps
1. [Adım 1]
2. [Adım 2]
3. [Adım 3]

## Beklenen Davranış
[Ne olmalıydı]

## Gerçek Davranış
[Ne oldu]

## Ekran Görüntüleri
[Varsa]

## Ortam
- Browser: [Chrome/Firefox/Safari]
- Version: [x.x.x]
- OS: [Windows/Mac/Linux]

## Ek Bilgiler
[Loglar, console output, vb.]
```

### 7.2 Severity Levels
| Level | Açıklama | Yanıt Süresi |
|-------|----------|--------------|
| P0 (Critical) | Sistem çalışmıyor, veri kaybı | 1 saat |
| P1 (High) | Önemli özellik çalışmıyor | 4 saat |
| P2 (Medium) | Küçük özellik sorunu | 1 gün |
| P3 (Low) | UI/UX iyileştirmesi | 1 hafta |

---

## 8. İLETİŞİM

### 8.1 Kanallar
- **Slack**: #development, #general, #random
- **Email**: dev@tradingplatform.com
- **Meetings**: Daily standup, Sprint ceremonies
- **Docs**: Confluence/Notion

### 8.2 On-Call Rotasyonu
```
Haftalık rotasyon
Pazartesi 00:00 - Pazar 23:59

Primary: [Developer A]
Secondary: [Developer B]

Escalation:
1. Primary (15 min)
2. Secondary (15 min)
3. Tech Lead (15 min)
4. CTO
```

---

*Bu workflow rehberi Trading Platformu projesi için geliştirme sürecini tanımlar.*

Versiyon: 1.0
Son Güncelleme: 2026-02-01
