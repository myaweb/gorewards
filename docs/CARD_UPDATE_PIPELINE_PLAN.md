# Kart Veri Güncelleme Pipeline'ı — Uygulama Planı

## Mevcut Durum

- 33 Kanada kredi kartı `app/lib/cardData.ts` dosyasında hardcode edilmiş
- Cron job'daki scraper bozuk: cheerio import'u kapalı, parser boş array dönüyor, CSS selector'lar placeholder
- Otomatik güncelleme mekanizması yok, veriler elle girilmiş
- Mevcut Prisma şeması (`UpdateRecord`, `UpdateBatch`, `CardHistory`) zaten bu iş için uygun, değişiklik gerektirmiyor

## Veri Kaynağı Testi Sonuçları

| Kaynak | Durum | Not |
|---|---|---|
| Ratehub.ca | ✅ Mükemmel | Tüm bankaların kartları tek sayfada, güncel, zengin veri |
| TD.com | ✅ İyi | Kart adı, annual fee, faiz, bonus açıklamaları |
| Amex.com/ca | ✅ İyi (rendered) | Tüm kartlar, earn rate, bonus detayları |
| Scotiabank.com | ✅ Kısmen | Bonus koşulları var, kart listesi kısıtlı |
| RBC | ❌ | JS-rendered, veri gelmiyor |
| BMO | ❌ | 404, URL değişmiş |
| CIBC | ❌ | Timeout |

## Yeni Strateji

Ratehub.ca birincil kaynak olarak kullanılacak. Banka siteleri (TD, Amex, Scotiabank) ikincil doğrulama kaynağı olacak. RBC, BMO, CIBC için sadece Ratehub verisine güvenilecek.

Cron tetikleyici olarak **Vercel Cron** kullanılacak (mevcut 2 cron slotu yeterli, GitHub Actions gereksiz).

## Mimari

```
Vercel Cron (günlük, 02:00 UTC)
    │
    ▼
POST /api/cron/update-cards (CRON_SECRET ile auth)
    │
    ▼
CardUpdatePipeline (orchestrator)
    │
    ├── 1. fetchSources()
    │       ├── Ratehub.ca sayfasını fetch et (rendered)
    │       ├── TD.com sayfasını fetch et
    │       ├── Amex.com/ca sayfasını fetch et (rendered)
    │       └── Scotiabank.com sayfasını fetch et
    │
    ├── 2. parseWithAI()
    │       └── Gemini API'ye raw text gönder
    │           → Structured JSON döndür (kart adı, banka, annual fee, earn rate, bonus vs.)
    │
    ├── 3. diffWithDatabase()
    │       ├── Mevcut DB verilerini çek
    │       ├── AI çıktısı ile karşılaştır
    │       └── Değişen alanları tespit et
    │
    ├── 4. createPendingUpdates()
    │       ├── Fark varsa → UpdateBatch + UpdateRecord oluştur (status: PENDING)
    │       ├── Fark yoksa → Log yaz, bir şey yapma
    │       └── Hiç veri gelemediyse → Alert log yaz
    │
    └── 5. Return summary (kaç kaynak başarılı, kaç fark bulundu, hatalar)
```

Admin panelden mevcut akış devam eder: pending update'leri gör → onayla → DB güncelle.

> ⚠️ **NOT:** Mevcut admin panelinde pending update onay mekanizması YOK.
> Pipeline PENDING update oluşturacak ama bunları gösterecek, karşılaştıracak ve
> onaylayacak UI'ın da yazılması gerekiyor (Adım 5-7'de detaylandırılmıştır).

## Dosya Planı

### Yeni dosyalar

| Dosya | Açıklama |
|---|---|
| `lib/services/cardUpdatePipeline.ts` | Ana orchestrator. fetchSources, parseWithAI, diffWithDatabase, createPendingUpdates adımlarını sırayla çalıştırır. |
| `lib/services/aiCardParser.ts` | Gemini API entegrasyonu. Raw HTML/text alır, structured JSON döndürür. Prompt, validation, retry logic burada. |
| `lib/config/cardSources.ts` | Banka URL'leri, fetch mode (normal/rendered), öncelik sırası, timeout ayarları. |
| ~~`.github/workflows/update-cards.yml`~~ | ~~Gerek yok — Vercel Cron yeterli~~ |

### Değişecek dosyalar

| Dosya | Değişiklik |
|---|---|
| `app/api/cron/update-cards/route.ts` | Tamamen yeniden yazılacak. Eski scraper kaldırılacak, yerine `CardUpdatePipeline` çağrısı konacak. |
| `lib/services/cardDataUpdateService.ts` | `diffWithDatabase()` ve geliştirilmiş `createUpdate()` metotları eklenecek. |

### UI dosyaları (yeni)

| Dosya | Açıklama |
|---|---|
| `components/admin/pending-updates-panel.tsx` | Pipeline'ın ürettiği pending update'leri listeleyen, eski/yeni değerleri yan yana gösteren, tek tek veya toplu onay/red yapılabilen admin paneli. |

### UI dosyaları (değişecek)

| Dosya | Değişiklik |
|---|---|
| `components/admin-dashboard.tsx` | Yeni `PendingUpdatesPanel` componenti eklenecek. |
| `app/api/admin/card-updates/route.ts` | Pending update'leri onaylama (PATCH) ve reddetme (DELETE) endpoint'leri eklenecek. |

### Dokunulmayacak dosyalar

- `prisma/schema.prisma` — mevcut modeller yeterli
- `app/lib/cardData.ts` — statik referans olarak kalacak
- `components/admin/card-data-update-panel.tsx` — mevcut elle güncelleme paneli olduğu gibi kalacak
- Mevcut kart verileri (DB)

## Detaylı Adımlar

### Adım 0: Mevcut Admin Panel Durumu (Tespit)

Mevcut admin paneli (`card-data-update-panel.tsx`) sadece elle güncelleme yapıyor:
- Admin kart seçip form dolduruyor → `processUpdate()` hemen uygulanıyor
- Pending aşaması yok, onay mekanizması yok
- "Recent Updates" sadece geçmiş kayıtları gösteriyor

Pipeline'ın ürettiği PENDING update'leri gösterecek, eski/yeni değerleri karşılaştıracak ve onaylayacak yeni bir UI gerekiyor.

### Adım 1: `lib/config/cardSources.ts`

Banka kaynaklarının konfigürasyonu:

```typescript
interface CardSource {
  id: string
  name: string
  url: string
  fetchMode: 'standard' | 'rendered'
  priority: 'primary' | 'secondary'
  timeout: number
  enabled: boolean
}
```

- Ratehub.ca → primary, rendered mode
- TD, Amex, Scotiabank → secondary, doğrulama amaçlı
- Her kaynak için timeout ve enabled flag'i

### Adım 2: `lib/services/aiCardParser.ts`

Gemini API ile parse servisi:

- `parseCardData(rawText: string, sourceName: string): Promise<ParsedCard[]>`
- Prompt: "Bu web sayfası içeriğinden Kanada kredi kartı bilgilerini çıkar. Her kart için: name, bank, network, annualFee, welcomeBonusValue, baseRewardRate, groceryMultiplier, gasMultiplier, diningMultiplier, billsMultiplier döndür. JSON array formatında."
- Zod ile response validation
- Gemini parse edemezse boş array dön + error log
- Retry logic: 1 deneme, başarısızsa skip

### Adım 3: `lib/services/cardUpdatePipeline.ts`

Ana orchestrator:

```typescript
class CardUpdatePipeline {
  async run(): Promise<PipelineResult> {
    // 1. Kaynakları fetch et
    const sources = await this.fetchSources()
    
    // 2. AI ile parse et
    const parsedCards = await this.parseWithAI(sources)
    
    // 3. DB ile karşılaştır
    const diffs = await this.diffWithDatabase(parsedCards)
    
    // 4. Pending update'ler oluştur
    const updates = await this.createPendingUpdates(diffs)
    
    // 5. Sonuç döndür
    return { sources, parsedCards, diffs, updates }
  }
}
```

Diff logic:
- Kart eşleştirme: isim bazlı fuzzy match (küçük harf, trim, normalize)
- Karşılaştırılan alanlar: annualFee, welcomeBonusValue, baseRewardRate, multiplier'lar
- Tolerans: annualFee için ±$1, rate'ler için ±0.001
- Yeni kart bulunursa → "NEW_CARD" tipinde update oluştur
- Mevcut kart değiştiyse → "CARD_UPDATE" tipinde update oluştur

### Adım 4: `app/api/cron/update-cards/route.ts` (yeniden yazım)

- CRON_SECRET ile auth (mevcut pattern korunacak)
- **Vercel Cron sadece GET çağırır** — mevcut GET handler yeniden yazılacak
- `CardUpdatePipeline.run()` çağır
- Sonucu JSON olarak döndür
- Hata durumunda 500 + error detail

> ⚠️ **Timeout riski:** Vercel Hobby plan'da function timeout 10 saniye, Pro'da 60 saniye.
> 4 kaynak fetch + Gemini parse 10 saniyeye sığmayabilir.
> Çözüm: Kaynakları `Promise.allSettled()` ile paralel fetch et, Gemini'ye tek bir birleştirilmiş text gönder (4 ayrı call yerine 1 call).
> Hobby plan'daysa ve yine de sığmazsa, sadece Ratehub (primary) ile çalışacak şekilde fallback ekle.

### Adım 5: `app/api/admin/card-updates/route.ts` (güncelleme)

Mevcut POST ve GET'e ek olarak:

- `PATCH /api/admin/card-updates` → Pending update'i onayla
  - `updateId` alır, `CardDataUpdateService.processUpdate(id)` çağırır
  - Toplu onay desteği: `updateIds: string[]` ile birden fazla update onaylanabilir
- `DELETE /api/admin/card-updates` → Pending update'i reddet
  - `updateId` alır, status'ü `REJECTED` yapar (DB'ye uygulamaz)

### Adım 6: `components/admin/pending-updates-panel.tsx` (yeni)

Pipeline'ın ürettiği pending update'leri yöneten admin UI:

- Pending update listesi (kart adı, değişen alan, eski değer → yeni değer)
- Her update için yan yana diff görünümü:
  ```
  TD Aeroplan Visa Infinite
  ┌─────────────┬──────────┬──────────┐
  │ Alan        │ Mevcut   │ Yeni     │
  ├─────────────┼──────────┼──────────┤
  │ Annual Fee  │ $139     │ $149     │
  │ Welcome     │ $450     │ $500     │
  └─────────────┴──────────┴──────────┘
  [✓ Onayla]  [✗ Reddet]
  ```
- Toplu onay/red butonları (Select All → Approve All)
- Kaynak bilgisi (hangi siteden geldi)
- Son pipeline çalışma zamanı ve sonucu

### Adım 7: `components/admin-dashboard.tsx` (güncelleme)

- Mevcut dashboard'a `PendingUpdatesPanel` tab'ı veya section'ı ekle
- Pending update sayısını badge olarak göster (dikkat çekmesi için)

### ~~Eski Adım 5-6: GitHub Actions / Vercel cron temizliği~~ — İPTAL

Vercel Cron mevcut `vercel.json` ile çalışmaya devam edecek, değişiklik yok:

```json
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 10 * * *" },
    { "path": "/api/cron/update-cards", "schedule": "0 2 * * *" }
  ]
}
```

## Güvenlik

- Cron endpoint'i CRON_SECRET ile korunuyor (mevcut pattern)
- Gemini API key environment variable'dan okunuyor (mevcut `GEMINI_API_KEY`)
- Pipeline hiçbir zaman doğrudan DB'ye yazmaz, sadece pending update oluşturur
- Admin onayı olmadan kart verisi değişmez

## Bilinen Riskler ve Mitigasyonlar

| Risk | Mitigasyon |
|---|---|
| Ratehub sayfa yapısını değiştirirse | Gemini text-based parse yaptığı için DOM yapısına bağımlı değil. Ciddi değişikliklerde parse boş dönecek ve log'a düşecek. |
| Gemini tutarsız JSON dönerse | Zod validation ile catch edilecek. Geçersiz response → skip + error log. |
| Fetch timeout/hata | Her kaynak bağımsız try-catch içinde. Bir kaynak başarısız olursa diğerleri devam eder. |
| Vercel function timeout (Hobby: 10s) | Kaynakları paralel fetch (`Promise.allSettled`), Gemini'ye tek call. Sığmazsa sadece Ratehub ile çalış. |
| Yanlış veri parse edilirse | Otomatik DB yazma yok. Admin onayı gerekli. |

## Uygulama Sırası

1. `lib/config/cardSources.ts` — kaynak konfigürasyonu
2. `lib/services/aiCardParser.ts` — Gemini parse servisi
3. `lib/services/cardDataUpdateService.ts` — diff logic ekleme
4. `lib/services/cardUpdatePipeline.ts` — orchestrator
5. `app/api/cron/update-cards/route.ts` — endpoint yeniden yazımı
6. `app/api/admin/card-updates/route.ts` — PATCH (onayla) ve DELETE (reddet) endpoint'leri
7. `components/admin/pending-updates-panel.tsx` — pending update'leri gösteren, onay/red yapan UI
8. `components/admin-dashboard.tsx` — yeni paneli entegre et
