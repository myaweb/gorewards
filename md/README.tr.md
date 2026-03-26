# BonusGo - Kredi Kartı Ödül Optimizasyonu 💳✨

> Kanadalı kredi kartları için yapay zeka destekli kişiselleştirilmiş stratejilerle kredi kartı ödüllerinizi maksimize edin

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 BonusGo Nedir?

BonusGo, özellikle Kanadalı tüketiciler için tasarlanmış akıllı bir kredi kartı ödül optimizasyon platformudur. Farklı kategorilerdeki (market, yakıt, yemek, faturalar) harcama alışkanlıklarınızı analiz eder ve kredi kartı ödüllerini maksimize etmenize ve seyahat veya nakit geri ödeme hedeflerinize daha hızlı ulaşmanıza yardımcı olacak kişiselleştirilmiş bir yol haritası oluşturur.

### Çözüm Sunduğumuz Problem

- **Bilgi Yükü**: Farklı bonus yapıları, çarpanlar ve yıllık ücretlere sahip 50+ kredi kartı
- **Optimal Olmayan Seçimler**: Çoğu insan gerçek harcama alışkanlıklarından ziyade pazarlamaya göre kart seçiyor
- **Kaçırılan Fırsatlar**: Her yıl milyarlarca dolarlık ödül talep edilmiyor
- **Karmaşık Hesaplamalar**: Kartları manuel olarak karşılaştırmak ve optimal stratejileri hesaplamak zaman alıcı

### Çözümümüz

BonusGo, sofistike bir **RouteEngine** algoritması kullanır:
1. Aylık harcamalarınızı ana kategorilerde analiz eder
2. 50+ Kanadalı kredi kartını gerçek zamanlı değerlendirir
3. Optimal kart başvuru sırasını hesaplar
4. Hedeflerinize ulaşmak için ay ay yol haritası oluşturur
5. Bonus ilerlemesini ve harcama gereksinimlerini takip eder

## ✨ Ana Özellikler

### 🤖 Yapay Zeka Destekli Öneriler
- Harcama alışkanlıklarını analiz eden akıllı algoritma
- Güncel bonuslarla gerçek zamanlı kart veritabanı
- Hedeflerinize göre kişiselleştirilmiş stratejiler

### 📊 İnteraktif Kontrol Paneli
- Ay ay stratejiyi gösteren görsel yol haritası zaman çizelgesi
- Kayıt bonusları için ilerleme takibi
- Kategoriye dayalı harcama tahsisi
- Hedef tamamlama projeksiyonları

### 💳 Kapsamlı Kart Veritabanı
- Büyük bankalardan 50+ Kanadalı kredi kartı
- Hoş geldin bonuslarının gerçek zamanlı takibi
- Kategori çarpanları (market, yakıt, yemek, faturalar)
- Yıllık ücret ve ağ bilgileri

### 🎯 Hedefe Dayalı Planlama
- Önceden tanımlanmış hedefler (Tokyo Uçuşu, Avrupa Gezisi, Nakit Geri Ödeme)
- Özel puan hedefleri
- Çoklu ödül programları (Aeroplan, Scene+, Membership Rewards)

### 🔐 Premium Özellikler
- Birden fazla stratejiyi kaydetme ve takip etme
- Otomatik harcama analizi için Plaid entegrasyonu
- Bonus son tarihleri için e-posta hatırlatıcıları
- Gelişmiş karşılaştırma araçları

## 🏗️ Teknoloji Yığını

### Frontend
- **Next.js 14** - App Router ile React framework
- **TypeScript** - Tip güvenli geliştirme
- **Tailwind CSS** - Utility-first stil
- **Radix UI** - Erişilebilir bileşen primitifleri
- **Lucide Icons** - Güzel ikon kütüphanesi

### Backend
- **Next.js API Routes** - Sunucusuz fonksiyonlar
- **Prisma ORM** - Tip güvenli veritabanı erişimi
- **PostgreSQL** - İlişkisel veritabanı
- **Clerk** - Kimlik doğrulama ve kullanıcı yönetimi
- **Stripe** - Premium özellikler için ödeme işleme

### Entegrasyonlar
- **Plaid** - Banka hesabı bağlama ve işlem analizi
- **Resend** - İşlemsel e-posta servisi
- **PostHog** - Ürün analitiği
- **Google Gemini AI** - Yapay zeka destekli içerik üretimi
- **OpenAI** - Gelişmiş yapay zeka özellikleri

## 🚀 Başlangıç

### Ön Gereksinimler

- Node.js 18+ ve npm/yarn
- PostgreSQL veritabanı
- Clerk hesabı (kimlik doğrulama için)
- Stripe hesabı (ödemeler için)

### Kurulum

1. **Depoyu klonlayın**
```bash
git clone https://github.com/yourusername/bonusgo.git
cd bonusgo
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
yarn install
```

3. **Ortam değişkenlerini ayarlayın**

Kök dizinde bir `.env.local` dosyası oluşturun:

```env
# Veritabanı
DATABASE_URL="postgresql://user:password@localhost:5432/bonusgo"

# Clerk Kimlik Doğrulama
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk_yayinlanabilir_anahtariniz
CLERK_SECRET_KEY=clerk_gizli_anahtariniz
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
STRIPE_SECRET_KEY=stripe_gizli_anahtariniz
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=stripe_yayinlanabilir_anahtariniz
STRIPE_WEBHOOK_SECRET=stripe_webhook_gizli_anahtariniz

# Plaid (Opsiyonel)
PLAID_CLIENT_ID=plaid_client_id
PLAID_SECRET=plaid_gizli_anahtariniz
PLAID_ENV=sandbox

# E-posta (Resend)
RESEND_API_KEY=resend_api_anahtariniz

# Yapay Zeka (Opsiyonel)
GOOGLE_GENERATIVE_AI_API_KEY=gemini_api_anahtariniz
OPENAI_API_KEY=openai_api_anahtariniz

# Analitik
NEXT_PUBLIC_POSTHOG_KEY=posthog_anahtariniz
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

4. **Veritabanını kurun**
```bash
# Prisma client oluştur
npm run db:generate

# Migration'ları çalıştır
npm run db:migrate

# (Opsiyonel) Veritabanını seed'le
npm run db:push
```

5. **Geliştirme sunucusunu çalıştırın**
```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Proje Yapısı

```
bonusgo/
├── app/                      # Next.js App Router
│   ├── actions/             # Sunucu aksiyonları
│   │   ├── admin.actions.ts
│   │   ├── ai.actions.ts
│   │   └── strategy.actions.ts
│   ├── api/                 # API rotaları
│   │   ├── recommend/       # Kart öneri endpoint'i
│   │   ├── plaid/          # Plaid entegrasyonu
│   │   ├── stripe/         # Stripe webhook'ları
│   │   └── webhooks/       # Harici webhook'lar
│   ├── cards/              # Kart detay sayfaları
│   ├── compare/            # Kart karşılaştırma sayfaları
│   ├── dashboard/          # Kullanıcı kontrol paneli
│   ├── lib/                # Uygulamaya özel yardımcılar
│   │   ├── cardData.ts     # Ana kart veritabanı
│   │   └── recommendationEngine.ts
│   └── page.tsx            # Ana sayfa
├── components/              # React bileşenleri
│   ├── ui/                 # Yeniden kullanılabilir UI bileşenleri
│   ├── spending-form.tsx   # Harcama giriş formu
│   ├── roadmap-timeline.tsx # Görsel yol haritası
│   └── strategy-kanban.tsx # Strateji panosu
├── lib/                     # Paylaşılan yardımcılar
│   ├── services/           # İş mantığı
│   │   ├── routeEngine.ts  # Çekirdek optimizasyon algoritması
│   │   └── cardService.ts  # Kart veri servisi
│   ├── types/              # TypeScript tipleri
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Yardımcı fonksiyonlar
├── prisma/                  # Veritabanı şeması
│   └── schema.prisma
├── emails/                  # E-posta şablonları
└── public/                  # Statik varlıklar
```

## 🧮 RouteEngine Nasıl Çalışır?

**RouteEngine**, BonusGo'nun önerilerini güçlendiren çekirdek algoritmadır:

### 1. Kart Puanlama Algoritması
```typescript
Puan = (Bonus Değeri × 2) + Devam Eden Değer

Burada:
- Bonus Değeri = Hoş Geldin Bonus Puanları / Bonus Dönemi (ay)
- Devam Eden Değer = Aylık Harcama × Kategori Çarpanları
```

### 2. Yol Haritası Oluşturma
1. Hedef puan tipine göre kartları **filtrele** (Aeroplan, Scene+, vb.)
2. Kullanıcının harcama profiline göre kartları değer puanına göre **sırala**
3. Bonusları maksimize etmek için kart başvurularını **sırala**
4. Kategori çarpanlarını optimize etmek için harcamayı **tahsis et**
5. Kayıt bonusu gereksinimlerine doğru ilerlemeyi **takip et**
6. Hedefe ulaşmak için zaman çizelgesini **projekte et**

### 3. Optimizasyon Stratejileri
- Önce yüksek değerli kayıt bonuslarına öncelik ver
- Harcamayı bir seferde bir bonusa odakla
- Kategori çarpanlarını maksimize et (5x market, 3x yemek)
- Net değer hesaplamalarında yıllık ücretleri hesaba kat
- Minimum harcama gereksinimlerinin karşılandığından emin ol

## 🎨 Ana Bileşenler

### SpendingForm
Kullanıcıların aylık harcamalarını girmesi için kaydırıcılı interaktif form:
- Market (aylık 3.000$'a kadar)
- Yakıt (aylık 1.000$'a kadar)
- Yemek (aylık 2.000$'a kadar)
- Yinelenen Faturalar (aylık 2.000$'a kadar)

### RoadmapTimeline
Şunları gösteren görsel zaman çizelgesi:
- Kart başvuru adımları
- Aylık harcama tahsisleri
- Bonus ilerleme çubukları
- Kazanılan kümülatif puanlar
- Hedef tamamlama yüzdesi

### CardComparison
Yan yana kart karşılaştırması:
- Yıllık ücretler ve hoş geldin bonusları
- Kategori çarpanları
- Net değer hesaplamaları
- Yapay zeka tarafından oluşturulan kararlar

## 📊 Veritabanı Şeması

### Çekirdek Modeller
- **Card** - Kredi kartı bilgileri
- **CardBonus** - Hoş geldin bonus detayları
- **CardMultiplier** - Kategori kazanç oranları
- **User** - Kullanıcı hesapları ve premium durumu
- **SavedStrategy** - Kullanıcının kayıtlı yol haritaları
- **LinkedAccount** - Plaid banka bağlantıları

### Basitleştirilmiş Model (CreditCard)
Hızlı öneriler için düz yapı:
```prisma
model CreditCard {
  name               String
  bank               String
  annualFee          Float
  welcomeBonusValue  Float
  groceryMultiplier  Float
  gasMultiplier      Float
  diningMultiplier   Float
  billsMultiplier    Float
}
```

## 🔧 API Endpoint'leri

### `/api/recommend` (POST)
Kişiselleştirilmiş kart önerileri al
```json
{
  "grocery": 1200,
  "gas": 300,
  "dining": 600,
  "bills": 500
}
```

### `/api/plaid/create-link-token` (POST)
Banka bağlantısı için Plaid Link'i başlat

### `/api/stripe/checkout` (POST)
Premium yükseltme için Stripe ödeme oturumu oluştur

### `/api/admin/sync-cards` (POST)
Ana listeden kart veritabanını senkronize et (sadece admin)

## 🎯 Yol Haritası

### Faz 1: MVP ✅
- [x] Çekirdek RouteEngine algoritması
- [x] Temel kart veritabanı (50+ kart)
- [x] Harcama formu ve yol haritası görselleştirmesi
- [x] Kullanıcı kimlik doğrulaması

### Faz 2: Premium Özellikler 🚧
- [x] Stripe entegrasyonu
- [x] Stratejileri kaydetme ve takip etme
- [x] Otomatik harcama için Plaid entegrasyonu
- [ ] Bonus son tarihleri için e-posta hatırlatıcıları

### Faz 3: Gelişmiş Özellikler 📋
- [ ] Mobil uygulama (React Native)
- [x] Yapay zeka destekli harcama içgörüleri
- [ ] Kart başvuru takibi
- [ ] Yönlendirme programı
- [ ] Çoklu para birimi desteği

### Faz 4: Ölçeklendirme 🚀
- [ ] ABD pazarına genişleme
- [ ] Bankalarla ortaklık
- [ ] Kredi puanı entegrasyonu
- [ ] Yatırım ödülleri takibi

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Detaylar için lütfen [Katkıda Bulunma Rehberimize](CONTRIBUTING.md) bakın.

### Geliştirme İş Akışı
1. Depoyu fork'layın
2. Bir özellik dalı oluşturun (`git checkout -b feature/harika-ozellik`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Harika özellik ekle'`)
4. Dalı push'layın (`git push origin feature/harika-ozellik`)
5. Bir Pull Request açın

## 📝 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- Kart verileri resmi banka web sitelerinden alınmıştır
- İkonlar [Lucide](https://lucide.dev/) tarafından sağlanmıştır
- UI bileşenleri [Radix UI](https://www.radix-ui.com/) tarafından sağlanmıştır
- Kanadalı puan ve mil topluluğundan ilham alınmıştır

## 📧 İletişim

- Web sitesi: [bonusgo.ca](https://bonusgo.ca)
- E-posta: support@bonusgo.ca
- Twitter: [@bonusgo_ca](https://twitter.com/bonusgo_ca)

---

**Sorumluluk Reddi**: BonusGo bağımsız bir platformdur ve herhangi bir banka veya kredi kartı düzenleyicisi ile bağlantılı değildir. Kredi kartı teklifleri sıklıkla değişir - başvurmadan önce her zaman düzenleyicinin web sitesinde güncel teklifleri doğrulayın.
