# Gelişmiş Kredi Kartı Öneri Motoru

## Genel Bakış
Gelişmiş Öneri Motoru, kapsamlı kullanıcı profillerine ve sofistike puanlama algoritmalarına dayalı kişiselleştirilmiş kredi kartı önerileri sunan production-grade bir sistemdir.

## Ana Özellikler

### 1. Kayıt Bonusu Analizi
- **Harcama Gereksinimi Takibi**: Gerekli harcama miktarlarını ve zaman dilimlerini analiz eder
- **Ulaşılabilirlik Değerlendirmesi**: Kullanıcının harcama gereksinimlerini gerçekçi olarak karşılayıp karşılayamayacağını belirler
- **Puan Değerlendirmesi**: Bonus puanları puan türüne göre dolar değerine çevirir

### 2. Puan Değerlendirme Sistemi
Türe göre yapılandırılabilir puan değerlendirmeleri:
- **Aeroplan**: Puan başına 1.2¢
- **Amex Membership Rewards**: Puan başına 1.8¢  
- **RBC Avion**: Puan başına 1.0¢
- **Scene+**: Puan başına 1.0¢
- **Air Miles**: Mil başına 10.5¢
- **Aventura**: Puan başına 1.0¢
- **Marriott Bonvoy**: Puan başına 0.8¢
- **Hilton Honors**: Puan başına 0.5¢
- **Cashback**: Puan başına 1.0¢

### 3. Onay Olasılığı Puanlaması
Dikkate alınan faktörler:
- **Kredi Puanı Aralığı**: MÜKEMMEL (750+), İYİ (650-749), ORTA (550-649), ZAYIF (<550)
- **Yıllık Ücret Seviyesi**: Yüksek ücretler = daha sıkı onay gereksinimleri
- **Kurum Risk Seviyesi**: Amex (YÜKSEK), Büyük 6 Banka (ORTA), Diğerleri (DÜŞÜK)
- **Gelir Gereksinimleri**: Tahmini minimum gelir eşikleri

### 4. Kategori Harcama Limitleri
- **Aylık Limitler**: Aylık harcama limiti olan kartlar (örn. market için 5x, aylık 2.500$'a kadar)
- **Yıllık Limitler**: Yıllık harcama limiti olan kartlar
- **Geri Dönüş Oranları**: Limitler aşıldıktan sonra azaltılmış çarpanlar

### 5. İlk Yıl vs Uzun Vadeli Değer
- **Beklenen Değer Formülü**: `(onay_olasılığı * kayıt_bonus_değeri) + yıllık_harcama_ödülleri - yıllık_ücret`
- **İlk Yıl Değeri**: Kayıt bonusu etkisini içerir
- **Uzun Vadeli Değer**: Kayıt bonusu olmadan devam eden yıllık değer

## API Endpoint'leri

### POST /api/recommend/enhanced
Kapsamlı puanlama ile gelişmiş öneri endpoint'i.

**İstek Gövdesi:**
```json
{
  "spending": {
    "grocery": 500,
    "gas": 200, 
    "dining": 300,
    "bills": 150,
    "travel": 100,
    "shopping": 200
  },
  "creditScore": "GOOD",
  "annualIncome": 75000,
  "preferredPointTypes": ["AEROPLAN", "CASHBACK"],
  "maxAnnualFee": 200,
  "prioritizeSignupBonus": true,
  "timeHorizon": "LONG_TERM"
}
```

**Yanıt:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "card": {
          "id": "card-id",
          "name": "Scotiabank Gold American Express",
          "bank": "Scotiabank",
          "network": "AMEX",
          "annualFee": 120
        },
        "scores": {
          "expectedYearlyValue": 43147,
          "approvalProbability": 0.8,
          "signupBonusValue": 81000,
          "yearlySpendRewards": 1134,
          "longTermValue": -10866
        },
        "breakdown": {
          "signupBonus": {
            "points": 45000,
            "pointType": "MEMBERSHIP_REWARDS",
            "valueInCents": 81000,
            "requiredSpend": 1350,
            "spendPeriodMonths": 3,
            "achievable": true
          },
          "categoryRewards": [
            {
              "category": "grocery",
              "annualSpend": 6000,
              "multiplier": 0.06,
              "points": 360,
              "valueInCents": 648
            }
          ],
          "totalAnnualRewards": 1134,
          "netFirstYearValue": 53934,
          "netLongTermValue": -10866
        },
        "explanation": {
          "whyRecommended": "Ulaşılabilir kayıt bonusu ile mükemmel ilk yıl değeri",
          "pros": ["810$ değerinde ulaşılabilir kayıt bonusu", "Market harcamalarında 6x puan"],
          "cons": ["120$ yüksek yıllık ücret"],
          "bestFor": ["Market harcamaları", "Yemek harcamaları"]
        },
        "rank": 1,
        "confidence": 76
      }
    ],
    "userProfile": { /* kullanıcı profili */ },
    "metadata": {
      "totalCardsEvaluated": 31,
      "timestamp": "2026-03-12T15:00:00.000Z",
      "version": "2.0.0"
    }
  }
}
```

### POST /api/recommend (Legacy)
Geriye dönük uyumluluk için korundu. Basit net değer hesaplaması döndürür.

## Puanlama Algoritması

### Beklenen Yıllık Değer Hesaplaması
```
beklenen_değer = (onay_olasılığı * kayıt_bonus_değeri) + yıllık_harcama_ödülleri - yıllık_ücret
```

### Onay Olasılığı Faktörleri
1. **Temel Puan**: 50%
2. **Kredi Puanı Ayarlaması**: 
   - MÜKEMMEL: +40%
   - İYİ: +20%
   - ORTA: -10%
   - ZAYIF: -30%
3. **Yıllık Ücret Ayarlaması**:
   - Ücretsiz: +20%
   - Düşük Ücret (1-150$): +10%
   - Orta Ücret (151-300$): -5%
   - Yüksek Ücret (301-500$): -15%
   - Premium (500$+): -25%
4. **Kurum Risk Ayarlaması**:
   - Düşük Risk: +10%
   - Orta Risk: 0%
   - Yüksek Risk: -15%
5. **Gelir Gereksinimi**: Minimumun altındaysa -30%, 2x minimumsa +10%

### Kategori Ödülleri Hesaplaması
Her harcama kategorisi için:
1. Eşleşen kart çarpanını bul
2. Varsa harcama limitlerini uygula
3. Kazanılan puanları hesapla
4. Puan türü değerlendirmesini kullanarak dolar değerine çevir
5. Tüm kategori ödüllerini topla

## Uygulama Detayları

### TypeScript Türleri
- **UserProfile**: Tam kullanıcı harcama ve kredi profili
- **CardRecommendation**: Puanlar ve açıklamalarla kapsamlı öneri
- **RecommendationResult**: Tam API yanıt yapısı
- **EnhancedCardData**: Onay faktörleri ve harcama limitleri ile kart verisi

### Veritabanı Entegrasyonu
- Normalize edilmiş Card, CardBonus ve CardMultiplier modellerini kullanır
- Zamana dayalı teklifler ve çarpanları destekler
- Harcama limitlerini ve sınırlarını işler

### Hata Yönetimi
- Kullanıcı profilleri için Zod şema doğrulaması
- Eksik veriler için zarif geri dönüşler
- Kapsamlı hata mesajları

## Kullanım Örnekleri

### Temel Öneri
```typescript
const userProfile = {
  spending: { grocery: 500, gas: 200, dining: 300, bills: 150 },
  creditScore: CreditScoreRange.GOOD
}

const result = await EnhancedRecommendationEngine.getRecommendations(userProfile)
```

### Gelişmiş Öneri
```typescript
const userProfile = {
  spending: { grocery: 800, gas: 200, dining: 400, bills: 150, travel: 200 },
  creditScore: CreditScoreRange.EXCELLENT,
  annualIncome: 100000,
  preferredPointTypes: ['AEROPLAN', 'MEMBERSHIP_REWARDS'],
  maxAnnualFee: 500,
  prioritizeSignupBonus: true,
  timeHorizon: 'LONG_TERM'
}

const result = await EnhancedRecommendationEngine.getRecommendations(userProfile)
```

## Legacy Sisteme Göre Faydalar

1. **Gerçekçi Onay Değerlendirmesi**: Kredi profilini ve kart gereksinimlerini dikkate alır
2. **Doğru Puan Değerlendirmeleri**: Farklı puan türleri için farklı değerler
3. **Harcama Limiti Farkındalığı**: Aylık/yıllık limitleri doğru şekilde işler
4. **Kapsamlı Açıklamalar**: Öneriler için net gerekçeler
5. **Esnek Puanlama**: Yapılandırılabilir parametreler ve ağırlıklar
6. **Production Hazır**: Tam hata yönetimi ve doğrulama

## Gelecek Geliştirmeler

1. **Makine Öğrenmesi**: Daha iyi olasılık tahminleri için geçmiş onay verileri
2. **Dinamik Puan Değerleri**: Kullanım seçeneklerine dayalı gerçek zamanlı puan değerlendirmeleri
3. **Mevsimsel Ayarlamalar**: Sınırlı süreli teklifler ve promosyonları hesaba kat
4. **Kullanıcı Geri Bildirim Döngüsü**: Kullanıcı tercihlerinden ve sonuçlarından öğren
5. **Gelişmiş Limitler**: Karmaşık harcama limiti yapılarını işle
6. **Risk Değerlendirmesi**: Daha sofistike kredi riski modellemesi