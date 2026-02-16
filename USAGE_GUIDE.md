# Basketball Contract Generator - Usage Guide

## Bolt'ta Nasıl Kullanılır

### 1. Frontend'i Başlatma

Bolt otomatik olarak frontend'i başlatacaktır. Eğer başlatmadıysa, terminal'de şu komutu çalıştırın:

```bash
npm run dev
```

Bu komut frontend'i `http://localhost:5173` adresinde başlatacaktır.

### 2. Backend'i Başlatma

**Backend'i ayrı bir terminal'de başlatmanız gerekiyor:**

```bash
# Python paketlerini yükleyin (ilk kez)
pip install --break-system-packages -r requirements.txt

# Backend'i başlatın
python main.py
```

Backend `http://localhost:8000` adresinde çalışacaktır.

### 3. Uygulamayı Kullanma

1. Tarayıcınızda `http://localhost:5173` adresine gidin
2. Form alanlarını doldurun:
   - **Oyuncu Bilgileri**: İsim, pasaport numarası, doğum tarihi, vs.
   - **Kontrat Detayları**: Başlangıç/bitiş tarihleri, toplam maaş
   - **Ödeme Planı**: Taksitler ve tarihleri ekleyin
   - **Buyout Maddeleri** (Opsiyonel): Takım veya oyuncu buyout'u ekleyin

3. "Generate Contract" butonuna tıklayın
4. Kontrat Word dosyası otomatik olarak indirilecektir

## Özellikler

- Modern, kullanıcı dostu arayüz
- Dinamik ödeme planı ekleme
- Opsiyonel buyout maddeleri
- Gerçek zamanlı form validasyonu
- Otomatik dosya indirme
- Mobil uyumlu tasarım

## API Endpoints

- `GET /` - API durumu
- `POST /generate-contract` - Basitleştirilmiş kontrat oluşturma (Frontend için)
- `POST /generate` - Gelişmiş kontrat oluşturma (Eski API)

## Sorun Giderme

**Backend bağlanamıyor hatası:**
- Backend'in çalıştığından emin olun: `python main.py`
- Port 8000'in açık olduğunu kontrol edin

**Frontend çalışmıyor:**
- Node modüllerini yükleyin: `cd frontend && npm install`
- Dev sunucusunu başlatın: `npm run dev`

**CORS hatası:**
- Backend'in CORS middleware'i etkin
- Frontend'in doğru API URL'ini kullandığından emin olun

## Proje Yapısı

```
project/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx       # Ana uygulama komponenti
│   │   ├── App.css       # Stil dosyası
│   │   └── ...
│   └── package.json
├── templates/             # Word template dosyaları
├── main.py               # FastAPI backend
├── requirements.txt      # Python bağımlılıkları
└── package.json          # Root package.json
```

## Geliştirme

**Frontend geliştirme:**
```bash
cd frontend
npm run dev
```

**Backend geliştirme:**
```bash
uvicorn main:app --reload
```

**Build (Production):**
```bash
npm run build
```
