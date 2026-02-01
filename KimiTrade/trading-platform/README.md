# Trading Platform

Dünya standartlarında, gerçek zamanlı finansal veri analizi ve işlem platformu.

## Özellikler

- **Gelişmiş Grafikler**: WebGL tabanlı, 1M+ veri noktası @ 60fps
- **Teknik Göstergeler**: 400+ yerleşik gösterge
- **Özel Script Dili**: Pine Script benzeri DSL
- **Gerçek Zamanlı Veri**: WebSocket ile <10ms latency
- **Backtesting**: Strateji testi ve optimizasyon
- **İşlem Entegrasyonu**: Çoklu broker desteği
- **Sosyal Özellikler**: Fikir paylaşımı ve topluluk

## Mimari

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │     │ Mobile App  │     │  Desktop    │
│  (React)    │     │(React Nat.) │     │  (Electron) │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
              ┌────────────┴────────────┐
              │    API Gateway (Kong)   │
              └────────────┬────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
┌──────▼──────┐  ┌─────────▼────────┐  ┌──────▼──────┐
│   Charting  │  │   Market Data    │  │   Order     │
│   Engine    │  │    Service       │  │ Management  │
│  (Rust/WASM)│  │    (Rust)        │  │   (Rust)    │
└─────────────┘  └──────────────────┘  └─────────────┘
```

## Hızlı Başlangıç

### Gereksinimler

- Rust 1.75+
- Node.js 20+
- Docker & Docker Compose
- Go 1.21+ (opsiyonel)
- Python 3.11+ (opsiyonel)

### Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/[user]/trading-platform.git
cd trading-platform

# Development ortamını başlat
make dev

# Veya manuel
docker-compose -f docker-compose.dev.yml up -d
cargo run -p market-data &
cargo run -p charting-engine &
cd apps/web && pnpm dev
```

### Servisler

| Servis | Port | Açıklama |
|--------|------|----------|
| Web App | 3000 | React frontend |
| Market Data | 8080 | Veri servisi |
| Charting | 8081 | Grafik motoru |
| WebSocket | 8082 | Gerçek zamanlı veri |
| PostgreSQL | 5432 | Ana veritabanı |
| Redis | 6379 | Cache |
| Kafka | 9092 | Mesaj kuyruğu |

## Geliştirme

### Proje Yapısı

```
trading-platform/
├── apps/               # Uygulamalar
│   ├── web/           # React web app
│   ├── mobile/        # React Native
│   └── desktop/       # Electron
├── services/          # Backend servisler
│   ├── charting-engine/
│   ├── market-data/
│   ├── indicator-engine/
│   └── ...
├── packages/          # Paylaşılan paketler
│   ├── charting-library/
│   ├── indicator-library/
│   └── ui-components/
├── shared/            # Paylaşılan kod
│   ├── protobuf/
│   ├── types/
│   └── utils/
└── infrastructure/    # DevOps
    ├── kubernetes/
    ├── terraform/
    └── monitoring/
```

### Komutlar

```bash
# Tüm servisleri başlat
make dev

# Testleri çalıştır
make test

# Build
make build

# Lint
make lint

# Database migrate
make migrate

# Logları gör
make logs
```

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişiklikleri commit edin (`git commit -m 'feat: amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

MIT License - [LICENSE](LICENSE) dosyasına bakın.

## İletişim

- GitHub Issues: [github.com/[user]/trading-platform/issues](https://github.com/[user]/trading-platform/issues)
- Discord: [discord.gg/tradingplatform](https://discord.gg/tradingplatform)

---

**Not**: Bu proje aktif geliştirme aşamasındadır. API'ler değişebilir.
