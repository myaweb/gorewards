# Premium → Free-for-All + Donate Dönüşüm Planı

## Mevcut Premium Kontrol Noktaları

Tespit edilen tüm `isPremium` kontrolleri ve premium kısıtlamaları:

### 1. Dashboard — Hesap Durumu Gösterimi
**Dosya:** `app/dashboard/page.tsx`
**Satırlar:** 79, 226-244, 269-286, 396-430
**Mevcut:** Premium badge, "Free Plan" badge, "Upgrade" butonları, Bank Connections bölümü premium'a özel
**Yapılacak:** Tüm premium badge/upgrade butonlarını kaldır. Bank Connections herkese açık olacak (zaten çalışmıyor, "coming soon" olarak kalacak).

### 2. Dashboard — Bank Connections
**Dosya:** `app/dashboard/page.tsx`
**Satırlar:** 396-430
**Mevcut:** `!dbUser.isPremium` ise "Premium Only" badge gösteriyor, bağlantı butonu gizli
**Yapılacak:** Premium kontrolünü kaldır, herkese göster.

### 3. Billing Sayfası
**Dosya:** `app/dashboard/billing/page.tsx`
**Tüm sayfa**
**Mevcut:** Stripe subscription yönetimi, trial durumu, ödeme detayları
**Yapılacak:** Sayfayı tamamen yeniden yaz → Donate sayfasına dönüştür.

### 4. Pricing Sayfası
**Dosya:** `app/pricing/page.tsx`
**Tüm sayfa**
**Mevcut:** Free vs Premium karşılaştırma tablosu, $9/ay fiyatlandırma
**Yapılacak:** Sayfayı tamamen yeniden yaz → "Tüm özellikler ücretsiz" + donate CTA.

### 5. Product Sayfası — Pricing Bölümü
**Dosya:** `app/product/page.tsx`
**Satırlar:** ~730-850
**Mevcut:** Free vs Premium plan kartları
**Yapılacak:** Pricing bölümünü kaldır veya "Everything is free" mesajıyla değiştir.

### 6. Strateji Kaydetme Limiti
**Dosya:** `app/actions/strategy.actions.ts`
**Mevcut:** Limit kontrolü YOK — kodda 3 strateji limiti uygulanmıyor, sadece pricing sayfasında "Save up to 3" yazıyor
**Yapılacak:** Zaten limit yok, sadece UI'daki "up to 3" yazısını kaldır.

### 7. Stripe Webhook
**Dosya:** `app/api/webhooks/stripe/route.ts`
**Mevcut:** Subscription olaylarında `isPremium` güncelleniyor
**Yapılacak:** Webhook'u kaldırma — Stripe donate için de kullanılabilir. Ama `isPremium` güncellemesini kaldır.

### 8. Stripe Checkout
**Dosya:** `app/api/stripe/checkout/route.ts`
**Mevcut:** Premium subscription checkout
**Yapılacak:** Donate checkout'a dönüştür (one-time payment).

### 9. Stripe Portal
**Dosya:** `app/api/stripe/create-portal/route.ts`
**Mevcut:** Premium kullanıcılar için subscription yönetim portalı
**Yapılacak:** Kaldırılabilir veya donate geçmişi için bırakılabilir.

### 10. Navigation / Upgrade Butonları
**Dosya:** `components/upgrade-button.tsx`, `components/manage-subscription-button.tsx`
**Mevcut:** "Upgrade to Premium", "Manage Subscription" butonları
**Yapılacak:** Upgrade butonunu "Support Us" / donate butonuna dönüştür. Manage subscription kaldır.

### 11. Admin Dashboard — Premium User Count
**Dosya:** `components/admin-dashboard.tsx`, `app/actions/admin.actions.ts`
**Mevcut:** "Premium Users" metriği, kullanıcı premium durumu yönetimi
**Yapılacak:** "Premium Users" → "Supporters" (bağış yapanlar) olarak değiştir.

### 12. Prisma Schema — User Model
**Dosya:** `prisma/schema.prisma`
**Mevcut:** `isPremium Boolean @default(false)`
**Yapılacak:** Alanı kaldırma — `isDonor` veya `hasDonated` olarak yeniden adlandır veya olduğu gibi bırak (breaking change riski).

## Yapılmayacaklar (Dokunulmayacak)

- `prisma/schema.prisma` — `isPremium` alanı DB'de kalacak, migration riski yok
- `app/api/webhooks/stripe/route.ts` — Stripe webhook yapısı kalacak (donate için lazım olabilir)
- Clerk auth — değişiklik yok
- Plaid entegrasyonu — zaten herkese açılacak

## Uygulama Sırası

### Faz 1: Premium Duvarlarını Kaldır
1. `app/dashboard/page.tsx` — isPremium kontrollerini kaldır, tüm özellikleri herkese aç
2. `app/dashboard/billing/page.tsx` — Donate sayfasına dönüştür
3. `app/pricing/page.tsx` — "Everything is free" + donate CTA
4. `app/product/page.tsx` — Pricing bölümünü güncelle, hero'ya açıklama ekle
5. `components/upgrade-button.tsx` → donate butonuna dönüştür
6. `components/manage-subscription-button.tsx` → kaldır veya donate geçmişi

### Faz 2: Donate Sistemi
7. `app/api/stripe/checkout/route.ts` — One-time donate checkout
8. Donate butonu componenti (footer, dashboard, billing sayfası)
9. Navigation'a küçük "Support Us" linki

### Faz 3: Mesajlaşma Güncellemesi
10. Product hero — "100% free, community-supported" mesajı
11. Homepage — waitlist mesajını güncelle (artık premium yok)
12. Admin dashboard — "Premium Users" → "Supporters" metriği
