# CreditRich — Kullanıcı Deneyimi Raporu

## Siteye İlk Giriş (Giriş Yapmadan)

Ana sayfada karşına "Make Smarter Credit Card Decisions" başlığı çıkıyor. Closed beta olduğu için doğrudan kullanıma açık değil — waitlist'e e-posta bırakman gerekiyor. Bunun dışında:

- "See How It Works" butonu ile ürün tanıtım sayfasına gidebilirsin
- Kart karşılaştırma sayfasına (`/compare`) erişebilirsin — herhangi iki kartı yan yana karşılaştırabilirsin
- Bireysel kart detay sayfalarını (`/cards/[slug]`) görebilirsin
- Pricing sayfasından Free ve Premium planları inceleyebilirsin
- FAQ bölümünden temel soruların cevaplarını okuyabilirsin

Giriş yapmadan yapamayacağın şeyler: dashboard, profil oluşturma, kart portföyü, optimizasyon, strateji kaydetme.

## Kayıt Olup Giriş Yaptıktan Sonra

Clerk ile kayıt oluyorsun (Google, e-posta vs.). İlk girişte otomatik olarak veritabanında kullanıcı kaydın oluşuyor ve dashboard'a yönlendiriliyorsun.

### Yeni Kullanıcı Deneyimi (İlk Giriş)

Dashboard'da 3 adımlı bir onboarding süreci var:

1. **Finansal Profil Oluştur** — Aylık harcama alışkanlıklarını gir (market, benzin, restoran, faturalar, seyahat, alışveriş). Kredi skoru aralığını, yıllık gelirini, tercih ettiğin ödül tipini (seyahat puanı, cashback vs.) ve maksimum kabul edeceğin yıllık ücreti belirle.

2. **Kart Portföyü** — Şu an sahip olduğun kredi kartlarını sisteme ekle. Her kart için açılış tarihi ve yıllık ücret tarihi giriyorsun. Sistem bu kartların bonus takibini ve yıllık ücret hatırlatmalarını yapıyor.

3. **Kart Optimizasyonu** — Profilin ve kartların girildikten sonra sistem her harcama kategorisi için hangi kartını kullanman gerektiğini gösteriyor.

Ayrıca "Start Calculating" butonu ile harcama profiline göre kart önerisi hesaplatabilirsin.

### Aktif Kullanıcı Deneyimi (Profil Doldurulduktan Sonra)

Dashboard'da şunları görüyorsun:

- **Hesap durumu** — Free mi Premium mi
- **Strateji istatistikleri** — toplam, devam eden, tamamlanan strateji sayıları
- **Strateji Kanban board** — kaydettiğin kart stratejilerini kanban görünümünde takip ediyorsun
- **Hızlı erişim butonları** — Profil güncelle, Kartları yönet, Optimizasyonu gör

### Kart Portföyü Sayfası (`/dashboard/cards`)

- Sahip olduğun kartları listeliyorsun
- Her kart için: açılış tarihi, yıllık ücret tarihi, aktif/pasif durumu
- Signup bonus takibi: ne kadar harcaman gerekiyor, ne kadar harcadın, deadline ne zaman
- Yeni kart ekleme ve çıkarma

### Kart Optimizasyonu Sayfası (`/dashboard/optimization`)

- Harcama profiline ve kart portföyüne göre her kategori için en iyi kartını gösteriyor
- Örnek: "Market alışverişinde Amex Cobalt kullan (5x puan), benzinde TD Cash Back kullan (3% cashback)"
- Şu an manuel profil verisine dayalı çalışıyor
- Transaction sync (otomatik harcama takibi) "Coming Soon" olarak işaretli

### Kart Karşılaştırma (`/compare`)

- Herhangi iki kartı seçip yan yana karşılaştırabilirsin
- Yıllık ücret, bonus, multiplier'lar, network bilgileri karşılaştırılıyor
- AI destekli karşılaştırma yorumu (Gemini ile üretiliyor)

### Banka Bağlantısı (Plaid)

- Dashboard'da "Bank Connections" bölümü var
- Plaid ile bankana bağlanabilirsin
- Şu an beta aşamasında — bağlantı yapılabiliyor ama otomatik transaction tracking henüz aktif değil
- Sadece Premium kullanıcılara açık

## Free Plan ile Neler Yapabilirsin?

- Kart önerileri al (harcama profiline göre)
- Kart portföyünü takip et
- Herhangi iki kartı karşılaştır
- En fazla 3 strateji kaydet
- Kart detay sayfalarını gör

## Premium Plan ($9 CAD/ay) ile Ne Değişir?

- **Sınırsız strateji kaydetme** (Free'de 3 ile sınırlı)
- **Banka bağlantısı** — Plaid ile bankana bağlanabilirsin (beta)
- **Harcama analizleri** — Kategori bazlı harcama dağılımını gör
- **Gelişmiş açıklamalar** — AI destekli kart özellik ve avantaj açıklamaları
- **E-posta desteği** — Doğrudan ekiple iletişim
- **7 gün ücretsiz deneme** — İlk hafta ücretsiz, beğenmezsen iptal et

Premium'da henüz aktif olmayan ama "Coming Soon" olan özellikler:
- Otomatik transaction analizi ve kategorizasyonu
- Gerçek harcama verilerine dayalı optimizasyon

## Sistemin Sana Gerçekten Verdiği Değer (Dürüst Değerlendirme)

Çalışan ve değer katan şeyler:
- Kart karşılaştırma ve öneri motoru gerçek verilerle çalışıyor
- Harcama profiline göre hangi kartı nerede kullanman gerektiğini söylüyor
- Bonus takibi (ne kadar harcaman lazım, deadline ne zaman) faydalı
- AI karşılaştırma yorumları gerçekten üretiliyor (Gemini)

Eksik veya yarım kalan şeyler:
- Banka bağlantısı yapılabiliyor ama transaction tracking çalışmıyor — yani bağlasan bile bir şey olmuyor
- "Spending Insights" Premium özellik olarak satılıyor ama otomatik veri akışı olmadığı için sadece elle girdiğin verilere dayalı
- Strateji kaydetme var ama stratejinin ne olduğu, nasıl oluşturulduğu kullanıcıya tam net anlatılmıyor
- Kart verileri statik ve elle girilmiş (bu konuda pipeline'ı yeni kurduk)
- 33 kart var, "50+" iddiası abartılı
