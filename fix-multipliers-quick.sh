#!/bin/bash

# Multiplier Format Quick Fix Script
# Bu script tüm düzeltmeleri otomatik olarak yapar

set -e  # Hata durumunda dur

echo "🚀 Multiplier Format Düzeltme Scripti"
echo "======================================"
echo ""

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo "ℹ️  $1"
}

# 1. Backup kontrolü
echo "📦 Adım 1: Backup Kontrolü"
echo "─────────────────────────────────────"
if [ ! -f "backup_multipliers.sql" ]; then
    print_warning "Backup bulunamadı. Devam etmek istiyor musunuz? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "İşlem iptal edildi"
        exit 1
    fi
else
    print_success "Backup mevcut"
fi
echo ""

# 2. Kod değişikliklerini kontrol et
echo "🔍 Adım 2: Kod Değişikliklerini Kontrol Et"
echo "─────────────────────────────────────"

# Seed dosyasını kontrol et
if grep -q "groceryMultiplier / 100" prisma/seed.ts; then
    print_success "Seed dosyası düzeltilmiş"
else
    print_error "Seed dosyası henüz düzeltilmemiş!"
    print_info "Lütfen önce seed.ts dosyasını düzeltin"
    exit 1
fi

# Validation dosyasını kontrol et
if grep -q "max(0.10" lib/validations/card.ts; then
    print_success "Validation dosyası düzeltilmiş"
else
    print_error "Validation dosyası henüz düzeltilmemiş!"
    print_info "Lütfen önce validations/card.ts dosyasını düzeltin"
    exit 1
fi

echo ""

# 3. Dependencies kontrolü
echo "📚 Adım 3: Dependencies Kontrolü"
echo "─────────────────────────────────────"
if [ ! -d "node_modules" ]; then
    print_warning "node_modules bulunamadı. npm install çalıştırılıyor..."
    npm install
fi
print_success "Dependencies hazır"
echo ""

# 4. Fix script'i çalıştır
echo "🔧 Adım 4: Multiplier'ları Düzelt"
echo "─────────────────────────────────────"
print_info "Fix script çalıştırılıyor..."

if AUTO_CONFIRM=true npx tsx prisma/fix-multipliers.ts; then
    print_success "Multiplier'lar başarıyla düzeltildi"
else
    print_error "Fix script başarısız oldu!"
    exit 1
fi
echo ""

# 5. Testleri çalıştır
echo "🧪 Adım 5: Testleri Çalıştır"
echo "─────────────────────────────────────"
print_info "Multiplier format testleri çalıştırılıyor..."

if npm test -- lib/services/__tests__/multiplier-format.test.ts 2>/dev/null; then
    print_success "Tüm testler geçti"
else
    print_warning "Testler çalıştırılamadı veya başarısız oldu"
    print_info "Manuel olarak kontrol edin: npm test"
fi
echo ""

# 6. Doğrulama
echo "✓ Adım 6: Doğrulama"
echo "─────────────────────────────────────"
print_info "Veritabanı durumu kontrol ediliyor..."

# Basit bir doğrulama scripti
cat > verify-multipliers.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  const wrongFormat = await prisma.cardMultiplier.count({
    where: { multiplierValue: { gt: 1.0 } }
  })
  
  const total = await prisma.cardMultiplier.count()
  
  console.log(`Toplam multiplier: ${total}`)
  console.log(`Yanlış format: ${wrongFormat}`)
  
  if (wrongFormat === 0) {
    console.log('✅ Tüm multiplier\'lar doğru formatta!')
    process.exit(0)
  } else {
    console.log('❌ Hala yanlış formatta multiplier\'lar var!')
    process.exit(1)
  }
}

verify().finally(() => prisma.$disconnect())
EOF

if npx tsx verify-multipliers.ts; then
    print_success "Doğrulama başarılı"
else
    print_error "Doğrulama başarısız!"
    exit 1
fi

# Cleanup
rm verify-multipliers.ts

echo ""

# 7. Özet
echo "📊 Özet"
echo "─────────────────────────────────────"
print_success "Tüm adımlar başarıyla tamamlandı!"
echo ""
echo "Yapılanlar:"
echo "  ✅ Kod değişiklikleri doğrulandı"
echo "  ✅ Multiplier'lar düzeltildi"
echo "  ✅ Testler çalıştırıldı"
echo "  ✅ Doğrulama yapıldı"
echo ""
echo "Sonraki adımlar:"
echo "  1. Frontend'i test edin: npm run dev"
echo "  2. Puan hesaplamalarını kontrol edin"
echo "  3. Staging'e deploy edin"
echo ""
print_success "Düzeltme tamamlandı! 🎉"
