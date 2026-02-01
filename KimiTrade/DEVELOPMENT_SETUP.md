# GELİŞTİRME ORTAMI KURULUMU
## Bilgisayarınızı Nasıl Kullanacağım

---

## 1. BİLGİSAYARINIZI KULLANIM ŞEKLİM

### 1.1 Mevcut Durum
Şu anda **bulut ortamında** çalışıyorum ve tüm geliştirmeyi burada yapabilirim. Ancak bilgisayarınızı kullanmak isterseniz:

### 1.2 Seçenekler

#### Seçenek A: Tamamen Bulut (Önerilen)
- Tüm geliştirme bu ortamda yapılır
- Siz sadece GitHub'dan kodları çekersiniz
- Test ve geliştirme burada, production sizde

#### Seçenek B: Hibrit Model
- Backend servisler bilgisayarınızda çalışır
- Frontend geliştirme bilgisayarınızda
- Veritabanları ve cache bulutta veya Docker'da

#### Seçenek C: Tam Lokal
- Tüm stack bilgisayarınızda kurulu
- Ben kodları yazarım, siz derlersiniz/test edersiniz

---

## 2. BİLGİSAYARINIZ İÇİN GEREKSİNİMLER

### 2.1 Minimum Sistem Gereksinimleri
```
OS: Windows 10/11, macOS 12+, veya Linux (Ubuntu 22.04+)
RAM: 16 GB (32 GB önerilir)
Disk: 50 GB boş alan
CPU: 4 çekirdek (8 çekirdek önerilir)
GPU: WebGL 2.0 destekli (geliştirme için)
İnternet: 10 Mbps+ (veri feedleri için)
```

### 2.2 Kurulacak Yazılımlar

#### Backend Geliştirme
```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown

# Go
# macOS: brew install go
# Ubuntu: sudo apt install golang-go
# Windows: https://golang.org/dl/

# Python 3.11+
# macOS: brew install python@3.11
# Ubuntu: sudo apt install python3.11
# Windows: https://python.org/downloads
```

#### Frontend Geliştirme
```bash
# Node.js 20+
# macOS: brew install node@20
# Ubuntu: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# Windows: https://nodejs.org/

npm install -g pnpm
npm install -g @nrwl/cli
```

#### Altyapı
```bash
# Docker
curl -fsSL https://get.docker.com | sh

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# kubectl
curl -LO "https://dl.k8s/release/$(curl -L -s https://dl.k8s/release/stable.txt)/bin/linux/amd64/kubectl"

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Veritabanları (Docker ile)
```bash
# Tüm servisler Docker'da çalışacak
# Sizin kurmanıza gerek yok
```

---

## 3. HIZLI BAŞLANGIÇ (5 DAKİKA)

### 3.1 Repo Klonlama
```bash
# GitHub repo'su (ben oluşturacağım)
git clone https://github.com/[kullanıcı]/trading-platform.git
cd trading-platform
```

### 3.2 Development Ortamı Başlatma
```bash
# Tüm servisleri başlat
docker-compose -f docker-compose.dev.yml up -d

# Veya sadece veritabanları
docker-compose -f docker-compose.db.yml up -d
```

### 3.3 Servisleri Başlatma
```bash
# Terminal 1: Market Data Service
cd services/market-data
cargo run

# Terminal 2: Charting Engine
cd services/charting-engine
cargo run

# Terminal 3: Frontend
cd apps/web
pnpm install
pnpm dev
```

---

## 4. GELİŞTİRME WORKFLOW'U

### 4.1 Ben Kod Yazarım
```
1. Ben kodları yazarım (bulut ortamında)
2. GitHub'a push ederim
3. Siz pull edersiniz
4. Bilgisayarınızda test edersiniz
```

### 4.2 Siz Test Edersiniz
```bash
# Son değişiklikleri çek
git pull origin main

# Servisleri yeniden başlat
docker-compose restart

# Testleri çalıştır
cargo test
pnpm test

# E2E testler
pnpm test:e2e
```

### 4.3 Geri Bildirim
```
1. Hata bulursanız → GitHub Issue açın
2. Öneriniz varsa → Pull Request açın
3. Sorularınız varsa → Discussion başlatın
```

---

## 5. VSCODE AYARLARI

### 5.1 Önerilen Eklentiler
```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "golang.Go",
    "ms-python.python",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "ms-azuretools.vscode-docker"
  ]
}
```

### 5.2 settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "rust-analyzer.cargo.runBuildScripts": true,
  "rust-analyzer.procMacro.enable": true,
  "go.toolsManagement.autoUpdate": true,
  "python.formatting.provider": "black"
}
```

---

## 6. HIZLI KOMUTLAR

### 6.1 Makefile
```makefile
# Makefile içeriği
.PHONY: dev build test clean

dev:
	docker-compose -f docker-compose.dev.yml up -d
	cargo watch -x run -p market-data &
	cargo watch -x run -p charting-engine &
	cd apps/web && pnpm dev

build:
	cargo build --release
	cd apps/web && pnpm build

test:
	cargo test
	cd apps/web && pnpm test

clean:
	docker-compose down -v
	cargo clean
	rm -rf apps/web/node_modules
```

### 6.2 Justfile (Alternatif)
```just
# justfile
set shell := ["bash", "-cu"]

dev:
    docker-compose -f docker-compose.dev.yml up -d
    just run-services &
    just run-frontend

run-services:
    cargo watch -x run -p market-data
    cargo watch -x run -p charting-engine

run-frontend:
    cd apps/web && pnpm dev

test:
    cargo test
    cd apps/web && pnpm test
```

---

## 7. SIK KARŞILAŞILAN PROBLEMLER

### 7.1 Port Çakışmaları
```bash
# Kullanılan portları gör
lsof -i :3000
lsof -i :8080
lsof -i :5432

# Port değiştirme
# .env dosyasında PORT=3001 gibi değiştir
```

### 7.2 Docker Sorunları
```bash
# Container'ları temizle
docker system prune -a

# Volume'ları temizle
docker volume prune

# Tümünü sıfırla
docker-compose down -v
rm -rf ~/.docker
```

### 7.3 Rust Sorunları
```bash
# Cache temizle
cargo clean

# Toolchain güncelle
rustup update

# Bağımlılıkları yeniden çöz
cargo update
```

---

## 8. İLETİŞİM ve DESTEK

### 8.1 Gerçek Zamanlı İletişim
```
- GitHub Issues: Bug raporları
- GitHub Discussions: Sorular
- Discord/Slack: Günlük iletişim (opsiyonel)
```

### 8.2 Kod İnceleme Süreci
```
1. Ben feature branch'inde geliştirme yaparım
2. PR açarım
3. Siz review yaparsınız (opsiyonel)
4. CI geçince merge ederim
```

---

*Bu döküman geliştirme ortamı kurulumu için rehberdir.*
