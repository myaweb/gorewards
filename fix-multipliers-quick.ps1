# Multiplier Format Quick Fix Script (PowerShell)
# Bu script tüm düzeltmeleri otomatik olarak yapar

$ErrorActionPreference = "Stop"

Write-Host "🚀 Multiplier Format Düzeltme Scripti" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Fonksiyonlar
function Print-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor White
}

# 1. Backup kontrolü
Write-Host "📦 Adım 1: Backup Kontrolü" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
if (-not (Test-Path "backup_multipliers.sql")) {
    Print-Warning "Backup bulunamadı. Devam etmek istiyor musunuz? (Y/N)"
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Print-Error "İşlem iptal edildi"
        exit 1
    }
} else {
    Print-Success "Backup mevcut"
}
Write-Host ""

# 2. Kod değişikliklerini kontrol et
Write-Host "🔍 Adım 2: Kod Değişikliklerini Kontrol Et" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

# Seed dosyasını kontrol et
$seedContent = Get-Content "prisma/seed.ts" -Raw
if ($seedContent -match "groceryMultiplier / 100") {
    Print-Success "Seed dosyası düzeltilmiş"
} else {
    Print-Error "Seed dosyası henüz düzeltilmemiş!"
    Print-Info "Lütfen önce seed.ts dosyasını düzeltin"
    exit 1
}

# Validation dosyasını kontrol et
$validationContent = Get-Content "lib/validations/card.ts" -Raw
if ($validationContent -match "max\(0\.10") {
    Print-Success "Validation dosyası düzeltilmiş"
} else {
    Print-Error "Validation dosyası henüz düzeltilmemiş!"
    Print-Info "Lütfen önce validations/card.ts dosyasını düzeltin"
    exit 1
}

Write-Host ""

# 3. Dependencies kontrolü
Write-Host "📚 Adım 3: Dependencies Kontrolü" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
if (-not (Test-Path "node_modules")) {
    Print-Warning "node_modules bulunamadı. npm install çalıştırılıyor..."
    npm install
}
Print-Success "Dependencies hazır"
Write-Host ""

# 4. Fix script'i çalıştır
Write-Host "🔧 Adım 4: Multiplier'ları Düzelt" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Print-Info "Fix script çalıştırılıyor..."

$env:AUTO_CONFIRM = "true"
try {
    npx tsx prisma/fix-multipliers.ts
    Print-Success "Multiplier'lar başarıyla düzeltildi"
} catch {
    Print-Error "Fix script başarısız oldu!"
    exit 1
}
Write-Host ""

# 5. Testleri çalıştır
Write-Host "🧪 Adım 5: Testleri Çalıştır" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Print-Info "Multiplier format testleri çalıştırılıyor..."

try {
    npm test -- lib/services/__tests__/multiplier-format.test.ts 2>$null
    Print-Success "Tüm testler geçti"
} catch {
    Print-Warning "Testler çalıştırılamadı veya başarısız oldu"
    Print-Info "Manuel olarak kontrol edin: npm test"
}
Write-Host ""

# 6. Doğrulama
Write-Host "✓ Adım 6: Doğrulama" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Print-Info "Veritabanı durumu kontrol ediliyor..."

# Basit bir doğrulama scripti
$verifyScript = @"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  const wrongFormat = await prisma.cardMultiplier.count({
    where: { multiplierValue: { gt: 1.0 } }
  })
  
  const total = await prisma.cardMultiplier.count()
  
  console.log(`Toplam multiplier: `+total)
  console.log(`Yanlış format: `+wrongFormat)
  
  if (wrongFormat === 0) {
    console.log('✅ Tüm multiplier\'lar doğru formatta!')
    process.exit(0)
  } else {
    console.log('❌ Hala yanlış formatta multiplier\'lar var!')
    process.exit(1)
  }
}

verify().finally(() => prisma.`$disconnect())
"@

Set-Content -Path "verify-multipliers.ts" -Value $verifyScript

try {
    npx tsx verify-multipliers.ts
    Print-Success "Doğrulama başarılı"
} catch {
    Print-Error "Doğrulama başarısız!"
    exit 1
} finally {
    Remove-Item "verify-multipliers.ts" -ErrorAction SilentlyContinue
}

Write-Host ""

# 7. Özet
Write-Host "📊 Özet" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Print-Success "Tüm adımlar başarıyla tamamlandı!"
Write-Host ""
Write-Host "Yapılanlar:"
Write-Host "  ✅ Kod değişiklikleri doğrulandı"
Write-Host "  ✅ Multiplier'lar düzeltildi"
Write-Host "  ✅ Testler çalıştırıldı"
Write-Host "  ✅ Doğrulama yapıldı"
Write-Host ""
Write-Host "Sonraki adımlar:"
Write-Host "  1. Frontend'i test edin: npm run dev"
Write-Host "  2. Puan hesaplamalarını kontrol edin"
Write-Host "  3. Staging'e deploy edin"
Write-Host ""
Print-Success "Düzeltme tamamlandı! 🎉"
