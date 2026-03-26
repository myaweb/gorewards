# PostHog Test Rehberi

## ✅ Kurulum Tamamlandı!

PostHog API anahtarınız `.env.local` dosyasına eklendi:
- **API Key**: `phc_UbJ6RPW90r8FdnZA2TjOAMjSbSzZFqJCtmbkr5e6Lqs`
- **Host**: `https://us.posthog.com`

## 🚀 Hemen Test Edin

### Adım 1: Development Server'ı Yeniden Başlatın
```bash
# Mevcut server'ı durdurun (Ctrl+C)
# Sonra yeniden başlatın:
npm run dev
```

### Adım 2: Tarayıcıda Test Edin
1. Tarayıcınızı açın: `http://localhost:3000`
2. Karşılaştırma sayfasına gidin: `/compare/american-express-cobalt-vs-td-aeroplan`
3. Herhangi bir "Apply Now" butonuna tıklayın
4. Premium "Unlock Auto-Tracking" butonuna tıklayın

### Adım 3: PostHog Dashboard'da Kontrol Edin
1. PostHog dashboard'unuzu açın: https://us.posthog.com/project/sTMFPsFhdP1Ssg
2. Sol menüden **"Events"** → **"Live Events"** seçin
3. Şu eventleri göreceksiniz:
   - ✅ `$pageview` - Sayfa görüntülemeleri
   - ✅ `affiliate_link_clicked` - Affiliate link tıklamaları
   - ✅ `checkout_started` - Premium checkout başlatma

### Adım 4: Event Detaylarını İnceleyin
Her event'e tıklayarak şu bilgileri görebilirsiniz:
- **affiliate_link_clicked** için:
  - `cardName`: Hangi kart
  - `targetBank`: Hangi banka
  - `pageSlug`: Hangi karşılaştırma sayfası
  - `position`: Buton konumu (side_by_side, verdict_primary, vb.)
  
- **checkout_started** için:
  - `product`: premium_subscription
  - `price`: 9
  - `goal_name`: Kullanıcının hedefi
  - `total_points_earned`: Toplam puan

## 📊 İlk Dashboard'unuzu Oluşturun

### 1. Affiliate Performance Dashboard
1. PostHog'da **"Dashboards"** → **"New Dashboard"** tıklayın
2. İsim: "Affiliate Performance"
3. Şu insight'ları ekleyin:

**Toplam Tıklamalar**:
- Event: `affiliate_link_clicked`
- Visualization: Number
- Time range: Last 7 days

**Karta Göre Tıklamalar**:
- Event: `affiliate_link_clicked`
- Group by: `properties.cardName`
- Visualization: Bar chart

**Pozisyona Göre Tıklamalar**:
- Event: `affiliate_link_clicked`
- Group by: `properties.position`
- Visualization: Pie chart

### 2. Conversion Funnel
1. Yeni dashboard: "Conversion Funnel"
2. Funnel insight ekleyin:
   - Step 1: `$pageview` (URL contains `/compare/`)
   - Step 2: `affiliate_link_clicked`
   - Step 3: `checkout_started`

## 🎯 Hangi Metrikleri İzlemeliyim?

### Affiliate Metrikleri
- **En Çok Tıklanan Kartlar**: Hangi kartlar popüler?
- **En İyi Karşılaştırma Sayfaları**: Hangi sayfalar dönüşüm sağlıyor?
- **Buton Pozisyon Performansı**: Hangi pozisyon daha iyi?
- **Tıklama Oranı (CTR)**: Sayfa görüntüleme başına tıklama

### Premium Metrikleri
- **Checkout Başlatma**: Kaç kişi premium'a geçmeye çalışıyor?
- **Dönüşüm Oranı**: Başlatanların kaçı tamamlıyor?
- **Hedef Tercihleri**: Hangi hedefler upgrade'e yönlendiriyor?
- **Gelir Potansiyeli**: Aylık beklenen gelir

## 🔔 Önerilen Alertler

### Alert 1: Yüksek Affiliate Aktivitesi
- **Trigger**: `affiliate_link_clicked` > 50 in 1 hour
- **Action**: Email gönder
- **Amaç**: Viral trafiği veya başarılı kampanyaları tespit et

### Alert 2: Checkout Hataları
- **Trigger**: `checkout_error` > 3 in 1 hour
- **Action**: Slack bildirimi
- **Amaç**: Ödeme sorunlarını hızlıca çöz

### Alert 3: Sıfır Trafik
- **Trigger**: `$pageview` = 0 in 1 hour
- **Action**: Email gönder
- **Amaç**: Site çökmesini veya tracking sorununu tespit et

## 🧪 A/B Test Fikirleri

### Test 1: CTA Metni
- **Variant A**: "Apply Now"
- **Variant B**: "Get Your Bonus Now"
- **Metrik**: Click-through rate

### Test 2: Buton Rengi
- **Variant A**: Teal gradient (mevcut)
- **Variant B**: Green gradient
- **Metrik**: Total clicks

### Test 3: Buton Pozisyonu
- **Variant A**: Üstte ve altta CTA
- **Variant B**: Sadece altta CTA
- **Metrik**: Total clicks + time on page

## 🐛 Sorun Giderme

### Event'ler Görünmüyor?
1. **Console'u kontrol edin**: F12 → Console
   - "PostHog initialized" mesajını görmelisiniz
2. **Network tab'ı kontrol edin**: F12 → Network
   - `https://us.posthog.com` adresine istekler görmelisiniz
3. **API key'i kontrol edin**: `.env.local` dosyasında doğru mu?
4. **Server'ı yeniden başlatın**: `npm run dev`

### Event'ler Yanlış Properties ile Geliyor?
1. Browser console'da event'leri kontrol edin
2. PostHog dashboard'da event'e tıklayıp properties'i inceleyin
3. Kod'da `posthog.capture()` çağrısını kontrol edin

### Duplicate Event'ler?
1. React component'lerinde useEffect dependency'lerini kontrol edin
2. Event handler'ların birden fazla kez bağlanmadığından emin olun

## 📱 Mobil Test

### Mobil Cihazda Test
1. Aynı network'te olduğunuzdan emin olun
2. Local IP adresinizi bulun: `ipconfig` (Windows) veya `ifconfig` (Mac/Linux)
3. Mobil tarayıcıda açın: `http://YOUR_IP:3000`
4. Karşılaştırma sayfalarını test edin
5. PostHog'da mobil event'leri kontrol edin

## 🎓 Sonraki Adımlar

### Bu Hafta
- [x] PostHog kurulumu
- [x] API key ekleme
- [ ] Event'leri test et
- [ ] İlk dashboard'u oluştur
- [ ] Alertleri kur

### Bu Ay
- [ ] A/B testleri başlat
- [ ] Dönüşüm hunisini optimize et
- [ ] Session recording'i etkinleştir
- [ ] User identification ekle
- [ ] Daha fazla custom event ekle

### Bu Çeyrek
- [ ] Revenue attribution modeli oluştur
- [ ] Cohort analizi yap
- [ ] Personalization ekle
- [ ] Predictive analytics
- [ ] Diğer toollar ile entegrasyon

## 🎉 Başarı Kriterleri

### İlk Hafta
- ✅ 100+ pageview tracked
- ✅ 10+ affiliate click tracked
- ✅ 1+ checkout event tracked
- ✅ Dashboard oluşturuldu

### İlk Ay
- 📈 1,000+ pageviews
- 📈 100+ affiliate clicks
- 📈 10+ checkout events
- 📈 İlk optimizasyonlar yapıldı

### 3 Ay
- 🚀 10,000+ pageviews
- 🚀 1,000+ affiliate clicks
- 🚀 100+ checkout events
- 🚀 A/B testleri çalışıyor
- 🚀 Revenue attribution net

## 💡 Pro İpuçları

1. **Her Gün Kontrol Et**: İlk hafta her gün dashboard'u kontrol et
2. **Anomalileri İzle**: Ani trafik artışları veya düşüşleri not et
3. **Kullanıcı Yolculuğunu Anla**: Session recording'i izle
4. **Veri Odaklı Karar Ver**: Tahmin yerine data'ya bak
5. **Sürekli Test Et**: Her zaman bir A/B testi çalıştır

## 📞 Yardım

### Dokümantasyon
- **Detaylı Teknik Döküman**: `POSTHOG_ANALYTICS.md`
- **Hızlı Başlangıç**: `ANALYTICS_QUICKSTART.md`
- **Implementation Özeti**: `ANALYTICS_IMPLEMENTATION_SUMMARY.md`

### PostHog Kaynakları
- [PostHog Docs](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/community)
- [PostHog Blog](https://posthog.com/blog)

---

**Durum**: ✅ Kurulum tamamlandı, test etmeye hazır!
**Sonraki Adım**: Development server'ı yeniden başlat ve test et!
